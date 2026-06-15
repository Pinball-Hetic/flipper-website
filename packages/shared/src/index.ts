// DTOs partagés entre client et server.
// Les dates sont des strings après JSON.parse (sérialisation Server Action / fetch).

export interface ScoreDTO {
  id: string;
  value: number;
  user?: { name: string | null } | null;
}

export interface MachineDTO {
  id: string;
  name: string;
  checkpointId: string;
  scores: ScoreDTO[];
}

export interface CheckpointWithPosition {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  address?: string | null;
  lat: number;
  lng: number;
  position: [number, number];
  machines: MachineDTO[];
  createdAt: string;
}

export interface UserStatsDTO {
  visitCount: number;
  topScore: number | null;
}
