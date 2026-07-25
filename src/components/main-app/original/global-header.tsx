// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { Menu, User } from 'lucide-react';

interface GlobalHeaderProps {
  userRole: string;
  userName: string;
  branch?: string;
  onToggleSidebar: () => void;
  onLogout: () => void;
  sidebarCollapsed?: boolean;
}

export function GlobalHeader({
  userRole,
  userName,
  branch,
  onToggleSidebar,
  onLogout,
  sidebarCollapsed = false,
}: GlobalHeaderProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileMenuOpen]);

  const handleLogout = () => {
    setProfileMenuOpen(false);
    onLogout();
  };

  return (
    <header
      className="fixed top-0 right-0 bg-white border-b border-[#E5E7EB] z-50 transition-all duration-200"
      style={{ height: '56px', left: sidebarCollapsed ? '64px' : '240px' }}
    >
      <div className="h-full px-4 flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex flex-1 items-center justify-end gap-4">
          <div ref={profileMenuRef} className="relative pl-4 border-l border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((open) => !open)}
              className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-[#F9FAFB] transition-colors"
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
            >
              <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-semibold">
                <User className="w-5 h-5" />
              </div>
              <div className="text-sm text-left">
                <p className="font-medium text-[#111827]">{userName}</p>
                <p className="text-xs text-[#6B7280]">
                  {userRole}
                  {branch && ` • ${branch}`}
                </p>
              </div>
            </button>

            {profileMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-40 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-1 z-50"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-[#111827] hover:bg-[#F9FAFB] transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
