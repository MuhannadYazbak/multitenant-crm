export interface LegalCase {
  id: number;
  case_number: string;
  case_type: string;
  court?: string;
  status: string;
  client_id: number;
  created_at?: string;
}
export {}; // <--- Explicitly forces TypeScript to treat this file as a module