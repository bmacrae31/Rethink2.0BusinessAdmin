import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
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
import Overview from './dashboard/Overview';
import MemberList from '../components/members/MemberList';
import MemberProfile from './dashboard/MemberProfile';
import MembershipList from '../components/membership/MembershipList';
import Reports from './dashboard/Reports';
import Marketing from './dashboard/Marketing';
import Offers from './dashboard/Offers';
import UserManagement from './dashboard/Users';
import Storefront from './dashboard/Storefront';
import BusinessSettingsButton from '../components/settings/BusinessSettingsButton';
import ThemeToggle from '../components/ThemeToggle';
import { useSettings } from '../context/SettingsContext';
import HeroBackground from '../components/hero/HeroBackground';
import { useUserStore } from '../store/userStore';

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

export default function Dashboard() {
  const location = useLocation();
  const { settings } = useSettings();
  const [isNavVisible, setIsNavVisible] = useState(false);
  const currentUser = useUserStore(state => state.currentUser);
  const hasPermission = useUserStore(state => state.hasPermission);

  // Filter nav items based on user permissions
  const filteredNavItems = navItems.filter(item => 
    currentUser?.role === 'admin' || hasPermission(item.permission as any)
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Business Logo - Fixed Position */}
      <div className="fixed top-4 left-24 z-50">
        {settings?.branding?.logoUrl && (
          <img
            src={settings.branding.logoUrl}
            alt="Business Logo"
            className="h-8 w-auto"
          />
        )}
      </div>

      {/* Hover Navigation */}
      <div 
        className="fixed left-0 top-0 h-full z-50"
        onMouseEnter={() => setIsNavVisible(true)}
        onMouseLeave={() => setIsNavVisible(false)}
      >
        <div className={`w-16 h-full bg-transparent ${isNavVisible ? 'cursor-pointer' : ''}`} />
        <nav 
          className={`absolute top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
            isNavVisible ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-16" /> {/* Spacer for logo */}
          <div className="px-2 py-4">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-3 mb-1 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-16">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-1 items-center justify-end px-4 space-x-4">
            <ThemeToggle />
            <BusinessSettingsButton />
          </div>
        </div>

        {/* Hero section with dynamic background */}
        {location.pathname === '/' && <HeroBackground />}

        {/* Main content area */}
        <main className={`${location.pathname === '/' ? 'relative -mt-16' : ''} bg-white dark:bg-gray-900`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route index element={<Overview />} />
              <Route path="/members" element={<MemberList />} />
              <Route path="/members/:memberId" element={<MemberProfile />} />
              <Route path="/memberships" element={<MembershipList />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/storefront" element={<Storefront />} />
              <Route path="/users" element={<UserManagement />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}