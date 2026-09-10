import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { Park } from '../park';
import { ParkService } from '../park.service';

@Component({
  selector: 'app-park-detail',
  imports: [RouterLink],
  templateUrl: './park-detail.html',
  styleUrl: './park-detail.scss',
})
export class ParkDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ParkService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly park = signal<Park | null>(null);
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
