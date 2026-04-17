import type { IAnonymousNameGenerator } from "../domain/IAnonymousNameGenerator";

const NAMES = [
  "Cosmic_Bat", "Iron_Tilt", "Neon_Skull", "Pixel_Ghost", "Turbo_Raven",
  "Acid_Wolf", "Steel_Comet", "Dark_Pinball", "Hyper_Fox", "Blaze_Circuit",
  "Void_Hawk", "Cyber_Drake", "Nova_Bolt", "Flux_Tiger", "Storm_Viper",
  "Orbit_Cat", "Phantom_Blaze", "Shadow_Pulse", "Echo_Rider", "Neon_Cobra",
  "Atomic_Owl", "Feral_Drone", "Chrome_Specter", "Turbo_Panda", "Dusk_Flare",
  "Quantum_Rex", "Lunar_Wasp", "Prism_Wolf", "Venom_Star", "Glitch_Fox",
  "Static_Crow", "Obsidian_Ace", "Rogue_Comet", "Plasma_Shark", "Stray_Volt",
  "Drift_Falcon", "Zenith_Bear", "Apex_Ghost", "Neon_Basilisk", "Iron_Specter",
  "Turbo_Mantis", "Cyber_Lynx", "Blitz_Raven", "Onyx_Pulse", "Laser_Toad",
  "Vortex_Elk", "Crystal_Hornet", "Nitro_Phantom", "Warp_Jackal", "Eclipse_Cat",
];

export class RandomAnonymousNameGenerator implements IAnonymousNameGenerator {
  generate(): string {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `${name}_${suffix}`;
  }
}
