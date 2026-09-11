import { Park } from './park';
import { ParkFacility } from './park-facility';

export interface ParkDetail extends Park {
  facilities: ParkFacility[];
}
