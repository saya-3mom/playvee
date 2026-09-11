import { Park } from './park';
import { ParkPhoto } from './park-photo';
import { ParkFacility } from './park-facility';

export interface ParkDetail extends Park {
  photos: ParkPhoto[];
  facilities: ParkFacility[];
}
