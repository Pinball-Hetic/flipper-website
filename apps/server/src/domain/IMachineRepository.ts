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
  topScores: Array<{ value: number; userName: string | null }>;
}

export interface IMachineRepository {
  existsById(id: string): Promise<boolean>;
  findAll(): Promise<Machine[]>;
  findWithScoresByCheckpoint(checkpointId: string): Promise<MachineWithScores[]>;
}
