import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Park } from '../park';
import { ParkService } from '../park.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-park-list',
  imports: [RouterLink],
  templateUrl: './park-list.html',
  styleUrl: './park-list.scss',
})
export class ParkList implements OnInit {
  private readonly parkService = inject(ParkService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly parks = signal<Park[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);

  ngOnInit(): void {
    this.parkService.getParks().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (parks) => {
        this.parks.set(parks);
        this.loading.set(false);
      },
      error: () => {
        this.failed.set(true);
        this.loading.set(false);
      },
    });
  }
}
