// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { Search, Bell, Flag, Menu, User } from 'lucide-react';

interface GlobalHeaderProps {
  userRole: string;
  userName: string;
  branch?: string;
  notificationCount?: number;
  flagCount?: number;
  onToggleSidebar: () => void;
  onSearchClick: () => void;
  onLogout: () => void;
  sidebarCollapsed?: boolean;
}

export function GlobalHeader({
  userRole,
  userName,
  branch,
  notificationCount = 0,
  flagCount = 0,
  onToggleSidebar,
  onSearchClick,
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

        <div className="flex-1 flex justify-center">
          <button
            onClick={onSearchClick}
            className="w-full max-w-[400px] h-9 px-3 flex items-center gap-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-lg text-left transition-colors"
          >
            <Search className="w-4 h-4 text-[#6B7280]" />
            <span className="flex-1 text-sm text-[#9CA3AF]">
              Search loans, customers, PAN...
            </span>
            <kbd className="px-2 py-0.5 text-xs bg-[#E5E7EB] text-[#6B7280] rounded">⌘K</kbd>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg">
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-xs font-semibold bg-[#DC2626] text-white rounded-full">
                {notificationCount}
              </span>
            )}
          </button>

          <button className="relative p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg">
            <Flag className="w-5 h-5" />
            {flagCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-xs font-semibold bg-[#DC2626] text-white rounded-full">
                {flagCount}
              </span>
            )}
          </button>

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
