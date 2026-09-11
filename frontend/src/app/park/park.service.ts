import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Park } from './park';
import { ParkDetail } from './park-detail';

@Injectable({ providedIn: 'root' })
export class ParkService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/parks';

  getParks(): Observable<Park[]> {
    return this.http.get<Park[]>(this.apiUrl);
  }

  getPark(id: string): Observable<ParkDetail> {
    return this.http.get<ParkDetail>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }
}
