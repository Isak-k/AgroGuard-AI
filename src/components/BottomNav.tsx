import { Home, Search, Camera, MapPin, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavItem {
  key: string;
  icon: React.ElementType;
  path: string;
  isScan?: boolean;
}

const navItems: NavItem[] = [
  { key: 'home', icon: Home, path: '/dashboard' },
  { key: 'diseases', icon: Search, path: '/diseases' },
  { key: 'scan', icon: Camera, path: '/scan', isScan: true },
  { key: 'markets', icon: MapPin, path: '/markets' },
  { key: 'profile', icon: User, path: '/profile' },
];

export function BottomNav() {
  const { t } = useLanguage();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-bottom">
      <div className="flex justify-around items-center h-20 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isScan) {
            return (
              <Link
                key={item.key}
                to={item.path}
                className="relative -mt-6"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl"
                  style={{
                    boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
                  }}
                >
                  <Icon className="w-7 h-7" />
                </motion.div>
              </Link>
            );
          }

          return (
            <Link
              key={item.key}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-colors min-w-[60px]",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Icon className={cn("w-6 h-6 mb-1", isActive && "text-primary")} />
              <span className="text-xs font-medium">{t(item.key)}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
