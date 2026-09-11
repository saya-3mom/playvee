import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ParkService } from '../park.service';

@Component({
  selector: 'app-park-create',
  imports: [FormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './park-create.html',
  styleUrl: './park-create.scss',
})
export class ParkCreate {
  private readonly service = inject(ParkService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected name = '';
  protected address = '';
  protected latitude = '';
  protected longitude = '';
  protected readonly saving = signal(false);
  protected readonly error = signal('');

  protected coordinateError(value: string, limit: number): string {
    if (!value.trim()) return '';
    if (!/^-?\d+(\.\d{1,6})?$/.test(value.trim()) || Math.abs(Number(value)) > limit) {
      return `-${limit}〜${limit}、小数点以下6桁までで入力してください。`;
    }
    return '';
  }

  protected get pairError(): boolean {
    return !!this.latitude.trim() !== !!this.longitude.trim();
  }

  protected submit(): void {
    if (this.saving()) return;
    if (!this.name.trim() || this.name.trim().length > 200 || !this.address.trim()
      || this.address.trim().length > 500 || this.pairError
      || this.coordinateError(this.latitude, 90) || this.coordinateError(this.longitude, 180)) {
      this.error.set('入力内容を確認してください。');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.service.createPark({ name: this.name.trim(), address: this.address.trim(),
      latitude: this.latitude.trim() ? Number(this.latitude) : null,
      longitude: this.longitude.trim() ? Number(this.longitude) : null,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => { void this.router.navigate(['/parks', result.id], { replaceUrl: true }); },
      error: error => {
        this.saving.set(false);
        this.error.set(error.status === 400 ? '入力内容を確認してください。' : '登録できませんでした。');
      },
    });
  }
}
