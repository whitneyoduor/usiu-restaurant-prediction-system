import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Package, 
  AlertTriangle, 
  Users, 
  TrendingUp,
  LogOut,
  ChefHat
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { userData, signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'chef', 'manager'] },
    { id: 'meals', label: 'Meal Recording', icon: UtensilsCrossed, roles: ['admin', 'chef'] },
    { id: 'inventory', label: 'Inventory', icon: Package, roles: ['admin', 'chef', 'manager'] },
    { id: 'alerts', label: 'Low Stock Alerts', icon: AlertTriangle, roles: ['admin', 'chef', 'manager'] },
    { id: 'forecast', label: 'Demand Forecast', icon: TrendingUp, roles: ['admin', 'manager'] },
    { id: 'users', label: 'User Management', icon: Users, roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    userData && item.roles.includes(userData.role)
  );

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <ChefHat className="w-8 h-8" />
          <div>
            <h1 className="text-lg">USIU Restaurant</h1>
            <p className="text-xs text-gray-400 capitalize">{userData?.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map(item => (
            <li key={item.id}>
              <Button
                variant={currentPage === item.id ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => onNavigate(item.id)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="mb-3 p-3 bg-gray-800 rounded">
          <p className="text-sm">{userData?.email}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
          onClick={signOut}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};
