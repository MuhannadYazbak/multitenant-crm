export interface Client {
  id?: number;
  name: string;
  phone: string;
  email: string;
  address?: string;
  custom_fields?: Record<string, any>;
}
export {}; // <--- Explicitly forces TypeScript to treat this file as a module