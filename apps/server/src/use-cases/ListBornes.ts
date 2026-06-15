import type { Checkpoint } from "../domain/Checkpoint";
import type { ICheckpointRepository } from "../domain/ICheckpointRepository";

export class ListBornes {
  constructor(private checkpoints: ICheckpointRepository) {}

  async execute(opts: { ownerUserId?: string } = {}): Promise<Checkpoint[]> {
    return this.checkpoints.list(opts);
  }
}
