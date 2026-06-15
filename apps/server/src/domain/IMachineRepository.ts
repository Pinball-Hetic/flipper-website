export interface Machine {
  id: string;
  name: string;
  checkpointId: string;
  checkpointName: string;
  createdAt: Date;
}

export interface MachineWithScores {
  id: string;
  name: string;
  checkpointId: string;
  scores: Array<{ id: string; value: number; user: { name: string | null; pseudo: string | null } | null }>;
}

export interface IMachineRepository {
  existsById(id: string): Promise<boolean>;
  findAll(): Promise<Machine[]>;
  findWithScoresByCheckpoint(checkpointId: string): Promise<MachineWithScores[]>;
}
