import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Park } from './park';
import { ParkDetail } from './park-detail';
import { ParkCreateRequest } from './park-create-request';
import { ParkPhoto } from './park-photo';
import { FacilityType, ParkFacility, ParkFacilityUpdateRequest } from './park-facility';

@Injectable({ providedIn: 'root' })
export class ParkService {
  createPark(request: ParkCreateRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.apiUrl, request);
  }
  updateFacility(parkId: number, type: FacilityType, request: ParkFacilityUpdateRequest): Observable<ParkFacility> {
    return this.http.put<ParkFacility>(`${this.apiUrl}/${parkId}/facilities/${type}`, request);
  }
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/parks';
  uploadPhoto(parkId: number, file: File): Observable<ParkPhoto> {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<ParkPhoto>(`${this.apiUrl}/${parkId}/photos`, body);
  }

  getParks(): Observable<Park[]> {
    return this.http.get<Park[]>(this.apiUrl);
  }

  getPark(id: string): Observable<ParkDetail> {
    return this.http.get<ParkDetail>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }
}
