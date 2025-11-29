import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LayoutGrid, Plus, User } from 'lucide-react';

export default function BottomNav({ currentPage }) {
  const tabs = [
    { id: 'Feed', icon: LayoutGrid, label: 'Feed' },
    { id: 'CreateEvent', icon: Plus, label: 'Add', isSpecial: true },
    { id: 'Profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.id;
          const Icon = tab.icon;

          if (tab.isSpecial) {
            return (
              <Link
                key={tab.id}
                to={createPageUrl(tab.id)}
                className="flex items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-lg transform -translate-y-2 hover:scale-105 transition-transform">
                  <Icon className="w-7 h-7 text-black" strokeWidth={2.5} />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={tab.id}
              to={createPageUrl(tab.id)}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
                isActive ? 'text-accent' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-xs mt-1 font-medium text-white">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
