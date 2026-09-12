import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected loginId = '';
  protected password = '';
  protected readonly busy = signal(false);
  protected readonly error = signal('');

  protected submit(): void {
    if (this.busy() || !this.loginId.trim() || !this.password) return;
    this.busy.set(true);
    this.error.set('');
    this.auth.login(this.loginId.trim(), this.password).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: user => {
        this.password = '';
        this.busy.set(false);
        if (user) void this.router.navigate(['/parks'], { replaceUrl: true });
        else this.error.set('ログイン状態を確認できませんでした。再度ログインしてください。');
      },
      error: error => {
        this.password = '';
        this.busy.set(false);
        this.error.set(error.status === 401 ? 'ログインIDまたはパスワードが違います。'
          : error.status === 403 ? 'ログインを再度お試しください。' : 'サーバーに接続できませんでした。');
      },
    });
  }
}
