export type FacilityType = 'TOILET' | 'DIAPER_CHANGING' | 'PARKING' | 'PLAYGROUND';
export type FacilityStatus = 'EXISTS' | 'NOT_EXISTS' | 'UNKNOWN';

export interface ParkFacility {
  type: FacilityType;
  status: FacilityStatus;
  lastCheckedOn: string | null;
}
