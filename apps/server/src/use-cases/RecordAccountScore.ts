import type { Score } from "../domain/Score";
import type { ICheckpointRepository } from "../domain/ICheckpointRepository";
import type { IMachineRepository } from "../domain/IMachineRepository";
import type { IScoreRepository } from "../domain/IScoreRepository";

export interface RecordAccountScoreInput {
  cabinetId: string;
  mapId: string;
  value: number;
  userId: string;
  playedAt: Date;
}

// Pont /v1 → table Score : matérialise un Score(machineId, userId) quand un
// score borne est réclamé par un COMPTE, pour les affichages existants.
// Retourne null (skip, pas d'erreur) si la borne n'est pas un Checkpoint enregistré.
export class RecordAccountScore {
  constructor(
    private checkpoints: ICheckpointRepository,
    private machines: IMachineRepository,
    private scores: IScoreRepository,
  ) {}

  async execute(input: RecordAccountScoreInput): Promise<Score | null> {
    const checkpoint = await this.checkpoints.findByCabinetId(input.cabinetId);
    if (!checkpoint) return null;

    const machine =
      (await this.machines.findByCheckpointAndMapId(checkpoint.id, input.mapId)) ??
      (await this.machines.create({
        checkpointId: checkpoint.id,
        name: input.mapId,
        mapId: input.mapId,
      }));

    return this.scores.saveFromPending({
      value: input.value,
      machineId: machine.id,
      userId: input.userId,
      createdAt: input.playedAt,
    });
  }
}
