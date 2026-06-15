import { randomInt } from "crypto";
import { z } from "zod";
import type { Checkpoint } from "../domain/Checkpoint";
import type { ICheckpointRepository } from "../domain/ICheckpointRepository";
import { ValidationError } from "./RegisterScore";

export class CabinetIdGenerationError extends Error {
  constructor() {
    super("Impossible de générer un cabinetId unique");
    this.name = "CabinetIdGenerationError";
  }
}

const CreateBorneSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.string().default("OTHER"),
  address: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  ownerUserId: z.string().optional(),
});

export type CreateBorneInput = z.input<typeof CreateBorneSchema>;

export interface CreateBorneResult {
  checkpoint: Checkpoint;
  cabinetId: string;
}

const MAX_CABINET_ID_ATTEMPTS = 10;
const SLUG_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

function generateCabinetId(): string {
  let slug = "";
  for (let i = 0; i < 8; i++) {
    slug += SLUG_ALPHABET[randomInt(0, SLUG_ALPHABET.length)];
  }
  return `brn_${slug}`;
}

export class CreateBorne {
  constructor(private checkpoints: ICheckpointRepository) {}

  async execute(input: CreateBorneInput): Promise<CreateBorneResult> {
    const result = CreateBorneSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError(result.error.errors[0]?.message ?? "Invalid input");
    }

    const data = result.data;
    const cabinetId = await this.allocateCabinetId();

    const checkpoint = await this.checkpoints.create({
      name: data.name,
      description: data.description,
      type: data.type,
      address: data.address,
      lat: data.lat,
      lng: data.lng,
      cabinetId,
      ownerUserId: data.ownerUserId,
    });

    return { checkpoint, cabinetId };
  }

  private async allocateCabinetId(): Promise<string> {
    for (let attempt = 0; attempt < MAX_CABINET_ID_ATTEMPTS; attempt++) {
      const cabinetId = generateCabinetId();
      const exists = await this.checkpoints.existsByCabinetId(cabinetId);
      if (!exists) return cabinetId;
    }
    throw new CabinetIdGenerationError();
  }
}
