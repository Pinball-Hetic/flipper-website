import { z } from "zod";
import type { IMachineRepository, MachineWithScores } from "../domain/IMachineRepository";
import { ValidationError } from "./RegisterScore";

const GetCheckpointScoresSchema = z.object({
  checkpointId: z.string().min(1),
});

export class GetCheckpointScores {
  constructor(private machines: IMachineRepository) {}

  async execute(input: { checkpointId: string }): Promise<MachineWithScores[]> {
    const result = GetCheckpointScoresSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError(result.error.errors[0]?.message ?? "Invalid input");
    }
    return this.machines.findWithScoresByCheckpoint(result.data.checkpointId);
  }
}
