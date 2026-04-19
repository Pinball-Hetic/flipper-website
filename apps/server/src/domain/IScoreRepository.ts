import type { Score } from "./Score";

export interface IScoreRepository {
  save(data: {
    value: number;
    machineId: string;
    pseudo: string;
    createdAt: Date;
  }): Promise<Score>;

  saveFromPending(data: {
    value: number;
    machineId: string;
    userId: string;
  }): Promise<Score>;

  existsRecentScore(machineId: string, pseudo: string, withinSeconds: number): Promise<boolean>;
  findTopByUser(userId: string): Promise<number | null>;
  existsByPseudo(pseudoLower: string): Promise<boolean>;
}
