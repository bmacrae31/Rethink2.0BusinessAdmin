import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { 
  Users, 
  Gift, 
  FileText, 
  Tag, 
  LayoutDashboard, 
  Mail, 
  UserCog,
  Store
} from 'lucide-react';
import { useUserStore } from '../../store/userStore';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/', permission: 'canViewDashboard' },
  { name: 'Members', icon: Users, path: '/members', permission: 'canViewMembers' },
  { name: 'Memberships', icon: Gift, path: '/memberships', permission: 'canViewMemberships' },
  { name: 'Reports', icon: FileText, path: '/reports', permission: 'canViewReports' },
  { name: 'Marketing', icon: Mail, path: '/marketing', permission: 'canViewMarketing' },
  { name: 'Offers', icon: Tag, path: '/offers', permission: 'canViewOffers' },
  { name: 'Storefront', icon: Store, path: '/storefront', permission: 'canManageStorefront' },
  { name: 'Users', icon: UserCog, path: '/users', permission: 'canManageUsers' }
];

export default function Navbar() {
  const location = useLocation();
  const { settings } = useSettings();
  const currentUser = useUserStore(state => state.currentUser);
  const hasPermission = useUserStore(state => state.hasPermission);

  // Filter nav items based on user permissions
  const filteredNavItems = navItems.filter(item => 
    currentUser?.role === 'admin' || hasPermission(item.permission as any)
  );

  return (
    <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 bg-white">
      <div className="flex items-center">
        <Link to="/">
          <img
            src={settings?.branding.logoUrl || "https://mellow-blancmange-dc9bc8.netlify.app/logo.png"}
            alt="Company Logo"
            className="h-8 w-auto"
          />
        </Link>
      </div>

      <nav className="hidden md:flex space-x-4">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}