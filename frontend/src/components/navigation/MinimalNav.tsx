import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ReleaseAlert } from '../../types';
import { Film, Ticket, Bell, Shield, Menu, X, User as UserIcon, LogOut } from 'lucide-react';

interface MinimalNavProps {
  user: User | null;
  alerts?: ReleaseAlert[];
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export const MinimalNav: React.FC<MinimalNavProps> = ({
  user,
  alerts = [],
  onOpenAuthModal,
  onLogout,
}) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Check if any alert has ticket open
  const hasActiveTicketOpen = alerts.some((a) => a.status === 'TICKETS_OPEN');

  const navLinks = [
    { label: 'MOVIES', path: '/movies', icon: Film },
    { label: 'MY BOOKINGS', path: '/bookings', icon: Ticket },
    {
      label: 'ALERTS',
      path: '/alerts',
      icon: Bell,
      badge: hasActiveTicketOpen ? 'OPEN' : alerts.length > 0 ? String(alerts.length) : null,
    },
  ];

  if (user?.role === 'ADMIN') {
    navLinks.push({ label: 'ADMIN', path: '/admin', icon: Shield });
  }


  return (
    <>
      <header className="fixed top-5 left-5 right-5 z-40 pointer-events-none flex items-start justify-between">
        {/* Top-Left OPAQUE Four-Tile Navigation (scaled +15%) */}
        <div className="flex flex-col items-start gap-2 pointer-events-auto">
          <div className="flex items-center gap-2">
            {/* Main Brand Tile: 66px height */}
            <Link
              to="/"
              className={`h-[60px] md:h-[66px] px-6 flex items-center justify-center border transition-all duration-300 ${
                location.pathname === '/'
                  ? 'bg-[#141414] text-white border-[#141414]'
                  : 'bg-[#fafafa]/90 backdrop-blur-[14px] text-[#141414] border-black/[0.08] hover:bg-[#f2f2f1]'
              }`}
            >
              <div className="flex flex-col items-start leading-none">
                <span className="text-[14px] font-bold tracking-[0.18em] uppercase">SHOW</span>
                <span className="text-[14px] tracking-[0.18em] uppercase text-[#8e8e8e] mt-1">TIME</span>
              </div>
            </Link>

            {/* Desktop Navigation Tiles */}
            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`h-[60px] md:h-[66px] px-5 flex items-center gap-2.5 border transition-all duration-300 relative ${
                      isActive
                        ? 'bg-black/[0.07] text-[#141414] border-black/20 font-semibold'
                        : 'bg-[#fafafa]/90 backdrop-blur-[14px] text-[#141414]/80 border-black/[0.08] hover:text-[#141414] hover:bg-white hover:border-black/15'
                    }`}
                  >
                    <span className="label-xs text-[12.5px] tracking-[0.08em]">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#141414] text-white leading-none">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Menu Trigger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden h-[60px] px-5 flex items-center justify-center bg-[#fafafa]/90 backdrop-blur-[14px] border border-black/[0.08] text-[#141414] pointer-events-auto"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Top-Right Area: User Profile */}
        <div className="pointer-events-auto flex items-center gap-2">
          {user ? (
            <div className="relative">
              <div
                className="h-[60px] md:h-[66px] px-4 flex items-center gap-3 bg-[#fafafa]/90 backdrop-blur-[14px] border border-black/[0.08] cursor-pointer hover:bg-white transition-all"
                onClick={() => setShowSignOutConfirm(true)}
                title="Click to sign out"
              >
                <div className="w-6 h-6 rounded-full bg-[#141414] text-white flex items-center justify-center text-[11px] font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[13px] font-medium leading-none text-[#141414]">
                    {user.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#8e8e8e] mt-0.5">
                    {user.role === 'ADMIN' ? 'Admin' : 'Member'}
                  </span>
                </div>
              </div>

              {/* Sign-out confirmation dropdown */}
              {showSignOutConfirm && (
                <>
                  {/* backdrop to close on outside click */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSignOutConfirm(false)}
                  />
                  <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 bg-white border border-black/10 shadow-lg p-4">
                    <p className="text-[12px] text-[#141414] font-medium mb-1">Sign out?</p>
                    <p className="text-[11px] text-[#8e8e8e] mb-4 leading-relaxed">
                      You will need to sign back in to access bookings and alerts.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowSignOutConfirm(false);
                          onLogout?.();
                        }}
                        className="flex-1 py-2 bg-[#141414] text-white text-[11px] font-semibold tracking-wider flex items-center justify-center gap-1.5 hover:bg-black transition-colors"
                      >
                        <LogOut size={12} />
                        SIGN OUT
                      </button>
                      <button
                        onClick={() => setShowSignOutConfirm(false)}
                        className="flex-1 py-2 border border-black/15 text-[#141414] text-[11px] tracking-wider hover:bg-[#fafafa] transition-colors"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="h-[60px] md:h-[66px] px-5 flex items-center gap-2.5 bg-[#fafafa]/90 backdrop-blur-[14px] border border-black/[0.08] text-[#141414] hover:bg-white transition-all"
            >
              <UserIcon size={16} className="text-[#8e8e8e]" />
              <span className="label-xs text-[12.5px]">SIGN IN</span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#fafafa]/98 backdrop-blur-xl pt-24 px-6 flex flex-col justify-between pb-10">
          <div className="flex flex-col gap-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 border-b border-black/[0.08] flex items-center justify-between text-lg font-medium"
            >
              <span>HOME / JOURNAL</span>
              <span className="text-xs text-[#8e8e8e]">01</span>
            </Link>
            {navLinks.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 border-b border-black/[0.08] flex items-center justify-between text-lg font-medium"
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className="text-[#8e8e8e]" />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="px-2 py-0.5 text-xs bg-[#141414] text-white">
                    {item.badge}
                  </span>
                ) : (
                  <span className="text-xs text-[#8e8e8e]">0{index + 2}</span>
                )}
              </Link>
            ))}
          </div>

          <div className="pt-6 border-t border-black/[0.08] flex items-center justify-between">
            {user ? (
              <button
                onClick={() => {
                  setShowSignOutConfirm(true);
                  setMobileMenuOpen(false);
                }}
                className="label-xs text-red-600 underline"
              >
                SIGN OUT
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuthModal?.();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 bg-[#141414] text-white label-xs text-center"
              >
                SIGN IN / REGISTER
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
