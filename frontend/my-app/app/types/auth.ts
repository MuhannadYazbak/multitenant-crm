export interface Role {
  id: number;
  name: string;
  permissions: string[]; // e.g., ["legal:read", "insurance:write"]
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  tenant_id: number;
  tenant_name?: string;
  tenant_type?: 'legal' | 'insurance' | 'both';
  roles: Role[];
  permissions: string[]; // Aggregated array of permission strings
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}