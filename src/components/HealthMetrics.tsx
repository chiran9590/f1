import React, { useState, useEffect } from 'react';
import { Activity, Heart, TrendingUp, Calendar } from 'lucide-react';

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  icon: any;
  color: string;
}

const HealthMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([
    {
      id: '1',
      name: 'Heart Rate',
      value: 72,
      unit: 'bpm',
      change: 2,
      icon: Heart,
      color: 'bg-red-500'
    },
    {
      id: '2', 
      name: 'Activity Level',
      value: 85,
      unit: '%',
      change: 5,
      icon: Activity,
      color: 'bg-green-500'
    },
    {
      id: '3',
      name: 'Health Score',
      value: 92,
      unit: '/100',
      change: 3,
      icon: TrendingUp,
      color: 'bg-blue-500'
    }
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading health metrics
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Health Metrics</h2>
        <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900">
          <Calendar className="w-4 h-4" />
          <span>Last 30 days</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`text-sm font-medium ${
                  metric.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{metric.name}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metric.value}
                  <span className="text-sm font-normal text-gray-500 ml-1">{metric.unit}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Trends</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Improving Health Score</p>
                <p className="text-sm text-gray-600">Your health metrics are trending positively</p>
              </div>
            </div>
            <span className="text-sm text-green-600 font-medium">+12%</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Activity Goal Reached</p>
                <p className="text-sm text-gray-600">Daily activity target achieved 5 days this week</p>
              </div>
            </div>
            <span className="text-sm text-blue-600 font-medium">83%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthMetrics;
