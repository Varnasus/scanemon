import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  testId?: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  testId
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Scan', href: '/scan', icon: '🪙' },
    { name: 'Collection', href: '/collection', icon: '📚' },
    { name: 'Analytics', href: '/analytics', icon: '📈' },
    { name: 'Profile', href: '/profile', icon: '👤' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={onClose}
        data-testid={testId || 'mobile-drawer'}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-gradient-to-b from-indigo-950 to-cyan-900 shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
                      <div className="flex items-center space-x-2">
                        <span role="img" aria-label="pokeball" className="text-2xl">🪙</span>
                        <span className="text-xl font-bold text-white">Scanémon</span>
                      </div>
                      <button
                        onClick={onClose}
                        className="rounded-md p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                        data-testid="mobile-drawer-close"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-6 py-4 space-y-2">
                      {navigationItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                          <button
                            key={item.name}
                            onClick={() => handleNavigation(item.href)}
                            className={`
                              w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                              transition-all duration-200 text-left
                              ${isActive 
                                ? 'bg-white/20 text-white shadow-lg' 
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                              }
                            `}
                            data-testid={`mobile-nav-${item.name.toLowerCase()}`}
                          >
                            <span className="text-xl" role="img" aria-hidden="true">
                              {item.icon}
                            </span>
                            <span className="font-medium">{item.name}</span>
                            {isActive && (
                              <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full" />
                            )}
                          </button>
                        );
                      })}
                    </nav>

                    {/* User Profile */}
                    <div className="border-t border-white/20 px-6 py-4">
                      {user ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {user.email?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm">
                              {user.email || 'User'}
                            </p>
                            <p className="text-white/60 text-xs">Level 3</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">G</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-white/70 text-sm">Guest</p>
                            <p className="text-white/50 text-xs">Sign in for full features</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

// Mobile menu button component
export const MobileMenuButton: React.FC<{
  onClick: () => void;
  testId?: string;
}> = ({ onClick, testId }) => {
  return (
    <button
      onClick={onClick}
      className="md:hidden p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      data-testid={testId || 'mobile-menu-button'}
      aria-label="Open navigation menu"
    >
      <Bars3Icon className="h-6 w-6" />
    </button>
  );
}; 