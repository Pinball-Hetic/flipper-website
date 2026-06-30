import { z } from "zod";
import type { Checkpoint } from "../domain/Checkpoint";
import type { ICheckpointRepository } from "../domain/ICheckpointRepository";
import { ValidationError } from "./RegisterScore";

export class CheckpointNotFoundError extends Error {
  constructor(id: string) {
    super(`Borne introuvable: ${id}`);
    this.name = "CheckpointNotFoundError";
  }
}

const UpdateBorneSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export type UpdateBorneInput = z.input<typeof UpdateBorneSchema>;

export class UpdateBorne {
  constructor(private checkpoints: ICheckpointRepository) {}

  async execute(input: UpdateBorneInput): Promise<Checkpoint> {
    const result = UpdateBorneSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError(result.error.errors[0]?.message ?? "Invalid input");
    }

    const { id, ...data } = result.data;

    const existing = await this.checkpoints.findById(id);
    if (!existing) throw new CheckpointNotFoundError(id);

    return this.checkpoints.update(id, data);
  }
}
