export interface ParkCreateRequest {
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}
