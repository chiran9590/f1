import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building, Map, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminOverview: React.FC = () => {
  const [counts, setCounts] = useState({ users: 0, clubs: 0, tiles: 0, metadata: 0 });

  useEffect(() => {
    const count = async (table: string) =>
      (await supabase.from(table).select('*', { count: 'exact', head: true })).count ?? 0;
    Promise.all([count('profiles'), count('clubs'), count('tiles'), count('metadata')]).then(
      ([users, clubs, tiles, metadata]) => setCounts({ users, clubs, tiles, metadata })
    );
  }, []);

  const cards = [
    { label: 'Users', value: counts.users, icon: Users, to: '/admin/users' },
    { label: 'Clubs', value: counts.clubs, icon: Building, to: '/admin/clubs' },
    { label: 'Tile files', value: counts.tiles, icon: Map, to: '/admin/upload' },
    { label: 'Metadata files', value: counts.metadata, icon: FileText, to: '/admin/upload' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, to }) => (
          <Link key={label} to={to} className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 hover:shadow">
            <Icon className="w-6 h-6 text-indigo-600 mb-3" />
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-600">{label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
