import type { IMachineRepository, Machine } from "../domain/IMachineRepository";

export class GetMachines {
  constructor(private machines: IMachineRepository) {}

  async execute(): Promise<Machine[]> {
    return this.machines.findAll();
  }
}
