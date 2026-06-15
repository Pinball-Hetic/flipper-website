import type { Checkpoint } from "./Checkpoint";

export interface CreateCheckpointData {
  name: string;
  description?: string;
  type: string;
  address?: string;
  lat: number;
  lng: number;
  cabinetId: string;
  ownerUserId?: string;
}

export interface UpdateCheckpointData {
  name?: string;
  description?: string;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface ICheckpointRepository {
  create(data: CreateCheckpointData): Promise<Checkpoint>;
  update(id: string, data: UpdateCheckpointData): Promise<Checkpoint>;
  findById(id: string): Promise<Checkpoint | null>;
  findByCabinetId(cabinetId: string): Promise<Checkpoint | null>;
  findByTokenHash(tokenHash: string): Promise<Checkpoint | null>;
  list(opts: { ownerUserId?: string }): Promise<Checkpoint[]>;
  existsByCabinetId(cabinetId: string): Promise<boolean>;
  // tokenHash reste interne au repo — jamais exposé dans l'entité Checkpoint.
  setToken(
    id: string,
    tokenHash: string | null,
    tokenCreatedAt: Date | null,
  ): Promise<void>;
}
