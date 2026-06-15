import type { Request, Response } from "express";
import { GetMachines } from "../use-cases/GetMachines";
import { PrismaMachineRepository } from "../infrastructure/PrismaMachineRepository";

export class MachineController {
  static async getAll(_req: Request, res: Response): Promise<void> {
    const useCase = new GetMachines(new PrismaMachineRepository());
    try {
      const machines = await useCase.execute();
      res.json(machines);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
