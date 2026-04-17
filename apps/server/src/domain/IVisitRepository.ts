export interface IVisitRepository {
  countByUser(userId: string): Promise<number>;
}
