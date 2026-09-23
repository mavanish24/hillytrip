import React, { useState, useEffect } from 'react';
import { UserRole } from '../../types/navigation';
import { roleService } from '../../services/navigation/RoleService';
import { permissionService } from '../../services/navigation/PermissionService';

interface RoleGuardProps {
  children: React.ReactNode;
  routePath: string;
  onNavigate?: (path: string) => void;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, routePath, onNavigate }) => {
  const [activeRole, setActiveRole] = useState<UserRole>(() => roleService.getActiveRole());

  useEffect(() => {
    return roleService.subscribe((state) => {
      setActiveRole(state.activeRole);
    });
  }, []);

  const clean = (routePath || '').replace(/^#/, '');
  const isAdminPath = clean === '/admin' || 
                      clean.startsWith('/admin/') || 
                      clean === '/operations' || 
                      clean === '/ops' || 
                      clean === '/platform' ||
                      clean === '/platform-console';

  const isAllowed = isAdminPath 
    ? (activeRole === 'ADMIN' || activeRole === 'SUPER_ADMIN')
    : permissionService.canAccessRoute(activeRole, routePath);

  useEffect(() => {
    if (!isAllowed) {
      if (activeRole === 'GUEST') {
        if (onNavigate) {
          onNavigate('#/login');
        } else if (typeof window !== 'undefined') {
          window.location.hash = '#/login';
        }
      } else {
        if (onNavigate) {
          onNavigate('#/');
        } else if (typeof window !== 'undefined') {
          window.location.hash = '#/';
        }
      }
    }
  }, [isAllowed, activeRole, onNavigate]);

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
};
