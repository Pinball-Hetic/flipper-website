import type { IUserRepository, UserSummary } from "../domain/IUserRepository";

export class ListUsers {
  constructor(private users: IUserRepository) {}

  async execute(): Promise<UserSummary[]> {
    return this.users.list();
  }
}
