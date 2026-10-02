import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Map, Leaf, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '../context/EnhancedAuthContext';
import LogoutButton from '../components/LogoutButton';

const PostLoginChooser: React.FC = () => {
  const { profile, role, isAdmin } = useAuth();

  const hasClubAssigned = !!profile?.club_id;
  const mapPath = isAdmin ? '/portal/map' : '/portal/map';
  const roleLabel = isAdmin ? 'Administrator' : 'Client';
  const scopeNote = isAdmin
    ? 'Full access to all golf courses and tile maps'
    : hasClubAssigned
      ? `Viewing data for your club`
      : 'Waiting for admin to assign your golf club';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="border-b border-green-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Health Maps</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-gray-500">{roleLabel}</p>
            </div>
            <LogoutButton showText={true} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Welcome back</h1>
          <p className="mt-2 text-gray-600">Choose how you want to work today</p>
          <p className="mt-1 text-sm text-green-700">{scopeNote}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            to="/portal/analyze"
            className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:border-green-300 hover:shadow-md"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-600 transition group-hover:bg-green-600 group-hover:text-white">
              <Camera className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Analyze Images</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Upload 1–10 turf images (PNG/JPG) for AI health analysis. Results appear in a simple grid.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-green-600 group-hover:gap-2">
              Open analyzer
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          {isAdmin || hasClubAssigned ? (
            <Link
              to={mapPath}
              className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:border-teal-300 hover:shadow-md"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-teal-100 text-teal-600 transition group-hover:bg-teal-600 group-hover:text-white">
                <Map className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Golf Course Map</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Open the tile map dashboard for course health overlays and spatial analysis.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-600 group-hover:gap-2">
                View map
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 shadow-sm">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-200 text-gray-400">
                <Clock className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Golf Course Map</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Waiting for an administrator to assign your golf club. Contact your admin for access.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-400">
                Pending assignment
              </span>
            </div>
          )}
        </div>

        {role === 'admin' && (
          <p className="mt-8 text-center text-sm text-gray-500">
            Admin tools:{' '}
            <Link to="/admin/dashboard" className="text-teal-600 hover:underline">
              Admin dashboard
            </Link>
          </p>
        )}
      </main>
    </div>
  );
};

export default PostLoginChooser;
