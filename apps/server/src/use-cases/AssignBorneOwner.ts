import type { Checkpoint } from "../domain/Checkpoint";
import type { ICheckpointRepository } from "../domain/ICheckpointRepository";
import type { IUserRepository } from "../domain/IUserRepository";
import { CheckpointNotFoundError } from "./UpdateBorne";
import { UserNotFoundError } from "./SetPseudo";

export { CheckpointNotFoundError, UserNotFoundError };

export class AssignBorneOwner {
  constructor(
    private checkpoints: ICheckpointRepository,
    private users: IUserRepository,
  ) {}

  async execute(borneId: string, ownerUserId: string | null): Promise<Checkpoint> {
    const borne = await this.checkpoints.findById(borneId);
    if (!borne) throw new CheckpointNotFoundError(borneId);

    if (ownerUserId !== null) {
      const user = await this.users.findById(ownerUserId);
      if (!user) throw new UserNotFoundError(ownerUserId);
    }

    await this.checkpoints.setOwner(borneId, ownerUserId);
    return { ...borne, ownerUserId: ownerUserId ?? undefined };
  }
}
