export interface PropertyData {
  property_type: string;
  area: number;
  address?: string;
}

export interface PropertyResponse extends PropertyData {
  id: string;
  client_id: number;
  created_at: string;
}
export {};