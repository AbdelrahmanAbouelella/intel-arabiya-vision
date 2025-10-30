import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { USE_MOCKS } from '@/lib/runtime';
import { Button } from '@/components/ui/button';
import {
  GlobeAltIcon,
  HomeIcon,
  BuildingOfficeIcon,
  HeartIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const { language, toggleLanguage, numerals, toggleNumerals } = useLanguage();

  const menuItems = [
    { label: t('nav.dashboard'), path: '/dashboard', icon: HomeIcon },
    { label: t('nav.companies'), path: '/companies', icon: BuildingOfficeIcon },
    { label: t('nav.watchlists'), path: '/watchlists', icon: HeartIcon },
    { label: t('nav.alerts'), path: '/alerts', icon: BellIcon },
    { label: t('nav.admin'), path: '/admin', icon: Cog6ToothIcon },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Corporate Intelligence
            </h1>
            {USE_MOCKS && (
              <span className="ml-2 rounded-md bg-amber-100 text-amber-800 px-2 py-0.5 text-xs border border-amber-300">Mock Mode</span>
            )}
          </div>

          <div className="flex flex-1 items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={toggleLanguage}>
              <GlobeAltIcon className="h-5 w-5 mr-2" />
              {language === 'en' ? 'AR' : 'EN'}
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleNumerals}>
              {numerals === 'western' ? '١٢٣' : '123'}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              {t('auth.signOut')}
            </Button>
          </div>
        </div>
      </header>

      <div className="container flex gap-6 px-4 py-6">
        <aside className="w-64 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Button>
          ))}
        </aside>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;

