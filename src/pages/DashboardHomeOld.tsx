import React from 'react';
import { useAuth } from '../context/EnhancedAuthContext';
import InstantHealthmap from '../components/InstantHealthmap';
import MyAssignedClubs from '../components/MyAssignedClubs';
import DashboardSwitcher from '../components/DashboardSwitcher';

const DashboardHome: React.FC = () => {
  const { user, profile } = useAuth();

  return (
    <div className="space-y-6">
      {/* Dashboard Switcher for Admin Users */}
      <DashboardSwitcher />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {profile?.full_name || user?.email}! Manage your healthmaps and view assigned clubs.
        </p>
      </div>

      {/* Main Content - Two Sections */}
      <div className="space-y-6">
        {/* Section 1: Instant Healthmap */}
        <InstantHealthmap />

        {/* Section 2: My Assigned Clubs */}
        <MyAssignedClubs />
      </div>
    </div>
  );
};

export default DashboardHome;
