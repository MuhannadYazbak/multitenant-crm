export interface WitnessData {
  name: string;
  age: number;
  phone: string;
  email: string;
  address?: string;

}

export interface WitnessResponse extends WitnessData {
  id: string;
  client_id: number;
  created_at: string;
}
export {};