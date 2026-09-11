import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { ParkDetail as ParkDetailData } from '../park-detail';
import { FacilityStatus, FacilityType } from '../park-facility';
import { ParkService } from '../park.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-park-detail',
  imports: [RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './park-detail.html',
  styleUrl: './park-detail.scss',
})
export class ParkDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ParkService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly park = signal<ParkDetailData | null>(null);
  protected readonly facilityNames: Record<FacilityType, string> = {
    TOILET: 'トイレ', DIAPER_CHANGING: 'おむつ替え', PARKING: '駐車場', PLAYGROUND: '遊具',
  };
  protected readonly statusNames: Record<FacilityStatus, string> = {
    EXISTS: 'ある', NOT_EXISTS: 'ない', UNKNOWN: '不明',
  };
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap((params) => {
        this.park.set(null);
        this.loading.set(true);
        this.error.set('');
        return this.service.getPark(params.get('id')!).pipe(
          catchError((error) => {
            this.error.set(error.status === 404
              ? '公園が見つかりません。'
              : '公園情報を取得できませんでした。');
            return of(null);
          }),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((park) => {
      this.park.set(park);
      this.loading.set(false);
    });
  }
}
