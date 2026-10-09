import { LucideIcon } from 'lucide-react';

export type UserRole = 
  | 'GUEST'
  | 'TRAVELLER'
  | 'BUSINESS_OWNER'
  | 'HOMESTAY_OWNER'
  | 'TAXI_OPERATOR'
  | 'GUIDE'
  | 'CONTENT_EDITOR'
  | 'MODERATOR'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  role: UserRole;
  membershipLevel?: 'EXPLORER' | 'SILVER_HILL' | 'GOLD_VALLEY' | 'PLATINUM_PEAK';
  businessName?: string;
  verified?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  iconName: string; // Dynamic icon reference
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'indigo' | 'rose' | 'sky';
  requiresAuth?: boolean;
  requiredRole?: UserRole[];
  description?: string;
  isAction?: boolean;
  actionId?: string;
  children?: MenuItem[];
}

export interface MenuSection {
  id: string;
  title?: string; // Optional section heading
  items: MenuItem[];
}

export interface NavigationConfig {
  role: UserRole;
  sections: MenuSection[];
}
