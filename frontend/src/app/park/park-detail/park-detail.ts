import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { ParkDetail as ParkDetailData } from '../park-detail';
import { FacilityStatus, FacilityType } from '../park-facility';
import { ParkService } from '../park.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

interface FacilityEditor {
  type: FacilityType;
  status: FacilityStatus;
  date: string;
  saving: boolean;
  message: string;
  failed: boolean;
}

@Component({
  selector: 'app-park-detail',
  imports: [RouterLink, MatCardModule, MatButtonModule, FormsModule, MatFormFieldModule, MatSelectModule, MatInputModule],
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
  protected readonly editors = signal<FacilityEditor[]>([]);
  protected readonly uploading = signal(false);
  protected readonly uploadMessage = signal('');
  protected readonly uploadFailed = signal(false);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly failedPhotos = signal<number[]>([]);
  private pageVersion = 0;

  protected selectPhoto(input: HTMLInputElement): void {
    this.selectedFile.set(input.files?.[0] ?? null);
    this.uploadMessage.set('');
  }

  protected photoFailed(id: number): void {
    this.failedPhotos.update(ids => [...ids, id]);
  }

  protected upload(input: HTMLInputElement): void {
    const park = this.park();
    const file = this.selectedFile();
    if (!park || !file || this.uploading()) return;
    this.uploadFailed.set(false);
    if (!file.size || file.size > 10 * 1024 * 1024) {
      this.uploadFailed.set(true);
      this.uploadMessage.set('空でない10MB以下のJPEG・PNGを選択してください。');
      return;
    }
    const version = this.pageVersion;
    this.uploading.set(true);
    this.uploadMessage.set('');
    this.service.uploadPhoto(park.id, file).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: photo => {
        if (version !== this.pageVersion) return;
        this.park.update(current => current && ({ ...current, photos: [...current.photos, photo] }));
        this.uploading.set(false);
        this.selectedFile.set(null);
        input.value = '';
        this.uploadMessage.set('写真を登録しました。');
      },
      error: error => {
        if (version !== this.pageVersion) return;
        this.uploading.set(false);
        this.uploadFailed.set(true);
        this.uploadMessage.set(error.status === 413 ? '写真は10MB以下にしてください。'
          : error.status === 400 || error.status === 415 ? '有効なJPEG・PNG（2500万画素以下）を選択してください。'
          : error.status === 404 ? '公園が見つかりません。' : 'アップロードできませんでした。');
      },
    });
  }

  protected save(editor: FacilityEditor): void {
    const park = this.park();
    if (!park || editor.saving) return;
    editor.saving = true;
    editor.message = '';
    editor.failed = false;
    this.editors.update(items => [...items]);
    this.service.updateFacility(park.id, editor.type, {
      status: editor.status, lastCheckedOn: editor.date || null,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: saved => {
        if (!this.editors().includes(editor)) return;
        this.park.update(current => current && ({
          ...current, facilities: current.facilities.map(item => item.type === saved.type ? saved : item),
        }));
        editor.status = saved.status;
        editor.date = saved.lastCheckedOn ?? '';
        editor.saving = false;
        editor.message = '更新しました。';
        this.editors.update(items => [...items]);
      },
      error: error => {
        if (!this.editors().includes(editor)) return;
        editor.saving = false;
        editor.failed = true;
        editor.message = error.status === 404 ? '公園が見つかりません。'
          : error.status === 400 ? '入力内容を確認してください。' : '更新できませんでした。再度お試しください。';
        this.editors.update(items => [...items]);
      },
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap((params) => {
        this.pageVersion++;
        this.uploading.set(false);
        this.selectedFile.set(null);
        this.uploadMessage.set('');
        this.failedPhotos.set([]);
        this.park.set(null);
        this.editors.set([]);
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
      this.editors.set(park?.facilities.map(facility => ({
        type: facility.type, status: facility.status, date: facility.lastCheckedOn ?? '',
        saving: false, message: '', failed: false,
      })) ?? []);
      this.loading.set(false);
    });
  }
}
