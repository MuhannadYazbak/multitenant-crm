export interface VehicleData {
  manufacturer: string;
  model: string;
  year: number;
  plate_no: string;
}

export interface VehicleResponse extends VehicleData{
  id: string;
  client_id: number;
  created_at: string;
}

export {};