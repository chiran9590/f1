import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAuth } from '../context/EnhancedAuthContext';
import { supabase } from '../lib/supabase';
import { Loader2, MapPin, Layers } from 'lucide-react';

const TOKEN: string = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
mapboxgl.accessToken = TOKEN;

// Tiles and GeoJSON are read through the `club-files` Edge Function, which checks the user's club.
const FILES_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/club-files`;

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'club';

const COLORS: [RegExp, string][] = [
  [/boundary/i, '#ffffff'], [/building/i, '#9ca3af'], [/water/i, '#38bdf8'], [/sand/i, '#fcd34d'],
  [/heath/i, '#a78bfa'], [/wetland|shrub/i, '#2dd4bf'], [/wood/i, '#15803d'], [/turf/i, '#4ade80'],
  [/hole|par/i, '#f97316'],
];
const colorFor = (name: string) => COLORS.find(([re]) => re.test(name))?.[1] ?? '#f472b6';

const esc = (v: unknown) =>
  String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

function extendBounds(b: mapboxgl.LngLatBounds, coords: any) {
  if (!Array.isArray(coords)) return;
  if (typeof coords[0] === 'number') b.extend([coords[0], coords[1]]);
  else coords.forEach((c) => extendBounds(b, c));
}

function tileCenter(z: number, x: number, y: number): [number, number] {
  const n = 2 ** z;
  const lon = ((x + 0.5) / n) * 360 - 180;
  const lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 0.5)) / n))) * 180) / Math.PI;
  return [lon, lat];
}

interface LayerItem { id: string; label: string; visible: boolean }

interface GolfCourseMapProps { clubId?: string }

const GolfCourseMap: React.FC<GolfCourseMapProps> = ({ clubId: propClubId }) => {
  const { profile } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const tokenRef = useRef('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clubName, setClubName] = useState('');
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [opacity, setOpacity] = useState(0.85);
  const [hasTiles, setHasTiles] = useState(true);
  const [minZoom, setMinZoom] = useState(0);
  const [zoom, setZoom] = useState(0);

  const clubId = propClubId || profile?.club_id;

  useEffect(() => {
    if (!clubId) { setLoading(false); return; }
    if (!TOKEN) {
      setLoading(false);
      setError('Mapbox token missing. Add VITE_MAPBOX_TOKEN to .env and restart the dev server.');
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    const run = async () => {
      try {
        setLoading(true); setError(null);

        const { data: sess } = await supabase.auth.getSession();
        tokenRef.current = sess.session?.access_token || '';
        const sub = supabase.auth.onAuthStateChange((_e, s) => { if (s?.access_token) tokenRef.current = s.access_token; });
        unsubscribe = () => sub.data.subscription.unsubscribe();
        const authHeaders = () => ({ Authorization: `Bearer ${tokenRef.current}` });

        const { data: club } = await supabase.from('clubs').select('club_name').eq('id', clubId).single();
        if (!club) throw new Error('Club not found');
        const slug = slugify(club.club_name);
        const q = `?club=${slug}`;
        setClubName(club.club_name);

        // Which zoom levels were uploaded?
        const zooms = await Promise.all(
          Array.from({ length: 12 }, (_, i) => i + 12).map(async (z) => ({
            z,
            n: (await supabase.from('tiles').select('*', { count: 'exact', head: true })
              .eq('club_id', clubId).like('file_path', `%/tiles/${z}/%`)).count ?? 0,
          }))
        );
        const zs = zooms.filter((c) => c.n > 0).map((c) => c.z);
        const { data: firstTile } = await supabase.from('tiles').select('file_path').eq('club_id', clubId).limit(1);

        // GeoJSON metadata layers
        const { data: metaRows } = await supabase.from('metadata').select('file_name, file_path')
          .eq('club_id', clubId).order('file_name');
        const geos = (
          await Promise.all(
            (metaRows || []).filter((r: any) => /\.(geo)?json$/i.test(r.file_name)).map(async (r: any) => {
              try {
                const rest: string = r.file_path.split('/metadata/')[1] ?? r.file_name;
                const url = `${FILES_URL}/metadata/${rest.split('/').map(encodeURIComponent).join('/')}${q}`;
                const res = await fetch(url, { headers: authHeaders() });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return { name: r.file_name as string, data: await res.json() };
              } catch (e) {
                console.warn('Could not load layer', r.file_name, e);
                return null;
              }
            })
          )
        ).filter(Boolean) as { name: string; data: any }[];

        // Where to look: course boundary if present, else all layers, else the first tile
        const bounds = new mapboxgl.LngLatBounds();
        const boundary = geos.find((g) => /boundary/i.test(g.name));
        for (const g of boundary ? [boundary] : geos) {
          for (const f of g.data?.features ?? []) if (f.geometry?.coordinates) extendBounds(bounds, f.geometry.coordinates);
        }
        let center: [number, number] | undefined;
        const m0 = firstTile?.[0]?.file_path?.match(/(\d+)\/(\d+)\/(\d+)\.\w+$/);
        if (bounds.isEmpty() && m0) center = tileCenter(+m0[1], +m0[2], +m0[3]);

        if (cancelled || !mapContainer.current) return;

        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: center ?? (bounds.isEmpty() ? [0, 20] : bounds.getCenter().toArray() as [number, number]),
          zoom: center ? 17 : bounds.isEmpty() ? 2 : 15,
          transformRequest: (url) => (url.startsWith(FILES_URL) ? { url, headers: authHeaders() } : { url }),
        });
        map.current = mapInstance;
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        mapInstance.addControl(new mapboxgl.ScaleControl(), 'bottom-right');
        mapInstance.on('zoom', () => setZoom(mapInstance.getZoom()));

        mapInstance.on('error', (e: any) => {
          // Missing tiles (404) are normal at the edges of the course; only surface login problems.
          const status = e?.error?.status;
          if (status === 401 || status === 403) setError('Not allowed to load this club’s map. Please sign in again.');
          else console.warn('Map warning:', e?.error?.message || e);
        });

        mapInstance.on('load', () => {
          const items: LayerItem[] = [];

          if (zs.length > 0) {
            const ext = (firstTile?.[0]?.file_path.split('.').pop() || 'png').toLowerCase();
            mapInstance.addSource('health', {
              type: 'raster',
              tiles: [`${FILES_URL}/tiles/{z}/{x}/{y}.${ext}${q}`],
              tileSize: 256,
              minzoom: Math.min(...zs),
              maxzoom: Math.max(...zs),
            });
            mapInstance.addLayer({
              id: 'health', type: 'raster', source: 'health',
              paint: { 'raster-opacity': 0.85, 'raster-fade-duration': 0 },
            });
            items.push({ id: 'health', label: 'Health map', visible: true });
            setMinZoom(Math.min(...zs));
            setHasTiles(true);
          } else {
            setHasTiles(false);
          }

          geos.forEach((g, idx) => {
            const id = `meta-${idx}`;
            const isBoundary = /boundary/i.test(g.name);
            const color = colorFor(g.name);
            const visibility = isBoundary ? 'visible' : 'none';
            const types = new Set<string>((g.data?.features ?? []).map((f: any) => f.geometry?.type));
            const has = (re: RegExp) => [...types].some((t) => re.test(t));

            mapInstance.addSource(id, { type: 'geojson', data: g.data });
            if (has(/Polygon/) && !isBoundary) {
              mapInstance.addLayer({
                id: `${id}-fill`, type: 'fill', source: id, layout: { visibility },
                paint: { 'fill-color': color, 'fill-opacity': 0.35 },
              });
              mapInstance.on('click', `${id}-fill`, (e) => {
                const props = e.features?.[0]?.properties ?? {};
                const rows = Object.entries(props).map(([k, v]) => `<div><b>${esc(k)}</b>: ${esc(v)}</div>`).join('');
                new mapboxgl.Popup().setLngLat(e.lngLat)
                  .setHTML(`<div style="font-size:12px"><b>${esc(g.name.replace(/\.(geo)?json$/i, ''))}</b>${rows}</div>`)
                  .addTo(mapInstance);
              });
              mapInstance.on('mouseenter', `${id}-fill`, () => (mapInstance.getCanvas().style.cursor = 'pointer'));
              mapInstance.on('mouseleave', `${id}-fill`, () => (mapInstance.getCanvas().style.cursor = ''));
            }
            if (has(/Polygon|LineString/)) {
              mapInstance.addLayer({
                id: `${id}-line`, type: 'line', source: id, layout: { visibility },
                paint: { 'line-color': color, 'line-width': isBoundary ? 3 : 1.5 },
              });
            }
            if (has(/Point/)) {
              mapInstance.addLayer({
                id: `${id}-point`, type: 'circle', source: id, layout: { visibility },
                paint: { 'circle-color': color, 'circle-radius': 4, 'circle-stroke-color': '#000', 'circle-stroke-width': 1 },
              });
            }
            items.push({ id, label: g.name.replace(/\.(geo)?json$/i, '').replace(/_/g, ' '), visible: isBoundary });
          });

          setLayers(items);
          if (!bounds.isEmpty()) mapInstance.fitBounds(bounds, { padding: 40, duration: 0 });
          setZoom(mapInstance.getZoom());
          setLoading(false);
        });
      } catch (err: any) {
        console.error('Error initializing map:', err);
        setError(err.message || 'Failed to initialize map');
        setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
      unsubscribe?.();
      map.current?.remove();
      map.current = null;
    };
  }, [clubId]);

  useEffect(() => {
    const m = map.current;
    if (m && m.getLayer('health')) m.setPaintProperty('health', 'raster-opacity', opacity);
  }, [opacity]);

  const toggle = (item: LayerItem) => {
    const m = map.current;
    if (!m) return;
    const visibility = item.visible ? 'none' : 'visible';
    if (item.id === 'health') m.setLayoutProperty('health', 'visibility', visibility);
    else (m.getStyle()?.layers ?? []).filter((l) => l.id.startsWith(`${item.id}-`))
      .forEach((l) => m.setLayoutProperty(l.id, 'visibility', visibility));
    setLayers((prev) => prev.map((l) => (l.id === item.id ? { ...l, visible: !l.visible } : l)));
  };

  if (!clubId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-100 rounded-lg p-8">
        <MapPin className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Club Assigned</h3>
        <p className="text-gray-600 text-center">
          You haven't been assigned to a golf club yet. Please contact an administrator.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-100 rounded-lg p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Map Error</h3>
        <p className="text-gray-600 text-center">{error}</p>
      </div>
    );
  }

  const health = layers.find((l) => l.id === 'health');

  return (
    <div className="relative w-full h-screen">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <span className="text-gray-600">Loading map…</span>
          </div>
        </div>
      )}

      <div ref={mapContainer} className="absolute inset-0" />

      {!loading && (
        <div className="absolute top-4 left-4 z-10 w-64 bg-white/95 rounded-lg shadow-md p-4 text-sm">
          <div className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" /> {clubName}
          </div>
          {layers.map((l) => (
            <label key={l.id} className="flex items-center gap-2 py-1 text-gray-700 cursor-pointer">
              <input type="checkbox" checked={l.visible} onChange={() => toggle(l)} /> {l.label}
            </label>
          ))}
          {health && (
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Health map opacity</div>
              <input type="range" min={0.1} max={1} step={0.05} value={opacity} className="w-full"
                     onChange={(e) => setOpacity(+e.target.value)} />
            </div>
          )}
          {!hasTiles && (
            <p className="mt-3 text-xs text-amber-700">No health-map tiles have been uploaded for this club yet.</p>
          )}
          {hasTiles && zoom < minZoom && (
            <p className="mt-3 text-xs text-amber-700">Zoom in to level {minZoom} to see the health map.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GolfCourseMap;
