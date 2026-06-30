import { randomBytes, createHash } from "crypto";
import type { ICheckpointRepository } from "../domain/ICheckpointRepository";
import { CheckpointNotFoundError } from "./UpdateBorne";

export { CheckpointNotFoundError };

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export class GenerateBorneToken {
  constructor(private checkpoints: ICheckpointRepository) {}

  async execute(checkpointId: string): Promise<{ token: string }> {
    const existing = await this.checkpoints.findById(checkpointId);
    if (!existing) throw new CheckpointNotFoundError(checkpointId);

    // Token en clair renvoyé UNE fois ; seul le hash est persisté.
    const token = `brk_${randomBytes(32).toString("hex")}`;
    await this.checkpoints.setToken(checkpointId, hashToken(token), new Date());

    return { token };
  }
}
