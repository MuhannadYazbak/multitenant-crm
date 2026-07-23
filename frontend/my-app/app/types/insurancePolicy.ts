export interface InsurancePolicy {
  id: number;
  policy_number: string;
  coverage_amount: number;
  client_id: number;
}
export {}; // <--- Explicitly forces TypeScript to treat this file as a module