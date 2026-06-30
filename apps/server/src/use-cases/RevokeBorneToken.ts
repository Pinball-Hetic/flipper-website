import type { ICheckpointRepository } from "../domain/ICheckpointRepository";
import { CheckpointNotFoundError } from "./UpdateBorne";

export { CheckpointNotFoundError };

export class RevokeBorneToken {
  constructor(private checkpoints: ICheckpointRepository) {}

  async execute(checkpointId: string): Promise<void> {
    const existing = await this.checkpoints.findById(checkpointId);
    if (!existing) throw new CheckpointNotFoundError(checkpointId);

    await this.checkpoints.setToken(checkpointId, null, null);
  }
}
