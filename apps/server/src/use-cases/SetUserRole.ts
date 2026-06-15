import { z } from "zod";
import type { IUserRepository } from "../domain/IUserRepository";
import { ValidationError } from "./RegisterScore";
import { UserNotFoundError } from "./SetPseudo";

export { ValidationError, UserNotFoundError };

const RoleSchema = z.enum(["user", "admin", "manager"]);

export class SetUserRole {
  constructor(private users: IUserRepository) {}

  async execute(userId: string, role: string): Promise<void> {
    const parsed = RoleSchema.safeParse(role);
    if (!parsed.success) throw new ValidationError("Rôle invalide");

    const user = await this.users.findById(userId);
    if (!user) throw new UserNotFoundError(userId);

    await this.users.updateRole(userId, parsed.data);
  }
}
