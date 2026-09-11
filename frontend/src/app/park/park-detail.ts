import { Park } from './park';
import { ParkPhoto } from './park-photo';
import { ParkFacility } from './park-facility';

export interface ParkDetail extends Park {
  latitude: number | null;
  longitude: number | null;
  photos: ParkPhoto[];
  facilities: ParkFacility[];
}
