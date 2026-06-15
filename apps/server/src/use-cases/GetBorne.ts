import type { Checkpoint } from "../domain/Checkpoint";
import type { ICheckpointRepository } from "../domain/ICheckpointRepository";
import { CheckpointNotFoundError } from "./UpdateBorne";

export { CheckpointNotFoundError };

export class GetBorne {
  constructor(private checkpoints: ICheckpointRepository) {}

  async execute(id: string): Promise<Checkpoint> {
    const checkpoint = await this.checkpoints.findById(id);
    if (!checkpoint) throw new CheckpointNotFoundError(id);
    return checkpoint;
  }
}
