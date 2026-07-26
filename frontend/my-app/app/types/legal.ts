export interface CaseNote {
  id: number;
  case_id: number;
  author_name: string;
  note_type: 'General' | 'Strategy' | 'Court Action' | 'Client Contact';
  content: string;
  is_pinned: boolean;
  created_at: string;
}

export interface CaseDocument {
  id: number;
  case_id: number;
  file_name: string;
  file_path: string;
  file_category: string;
  file_size_bytes: number;
  is_archived: boolean;
  uploaded_at: string;
}

export interface CaseBillingEntry {
  id: number;
  case_id: number;
  description: string;
  hours: number;
  rate: number;
  total_amount: number;
  is_paid: boolean;
  created_at: string;
}

export interface LegalCase {
  id: number;
  case_number: string;
  case_type: string;
  court: string;
  status: string;
  client_id: number;
  created_at: string;
  notes?: CaseNote[];
  documents?: CaseDocument[];
  billing_entries?: CaseBillingEntry[];
}