import { Component, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './auth/auth.service';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly loggingOut = signal(false);
  protected readonly logoutError = signal('');

  protected logout(): void {
    if (this.loggingOut()) return;
    this.loggingOut.set(true);
    this.logoutError.set('');
    this.auth.logout().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.loggingOut.set(false);
        void this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: error => {
        this.loggingOut.set(false);
        if (error.status === 401 || this.auth.user() === null) {
          this.auth.user.set(null);
          void this.router.navigate(['/login']);
        } else this.logoutError.set('ログアウトできませんでした。再度お試しください。');
      },
    });
  }
}
