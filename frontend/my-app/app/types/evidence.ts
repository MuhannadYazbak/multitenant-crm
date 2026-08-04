export interface EvidenceData {
  evidence_type: string;
  evidence_detail: string;

}

export interface EvidenceResponse extends EvidenceData {
  id: string;
  client_id: number;
  created_at: string;
}
export {};