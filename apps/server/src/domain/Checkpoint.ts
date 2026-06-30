export interface Checkpoint {
  id: string;
  name: string;
  description?: string;
  type: string;
  address?: string;
  lat: number;
  lng: number;
  cabinetId?: string;
  ownerUserId?: string;
  createdAt: Date;
}
