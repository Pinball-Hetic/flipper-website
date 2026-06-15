export interface IUserRepository {
  setPseudo(userId: string, pseudo: string, pseudoLower: string): Promise<void>;
  findByPseudo(pseudoLower: string): Promise<{ id: string } | null>;
  findById(
    userId: string,
  ): Promise<{
    id: string;
    pseudo: string | null;
    pseudoUpdatedAt: Date | null;
    role: string;
  } | null>;
}
