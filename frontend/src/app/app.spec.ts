import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { App } from './app';
import { of, throwError, Subject } from 'rxjs';
import { vi } from 'vitest';
import { ParkFacility } from './park/park-facility';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { ParkService } from './park/park.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: AuthService, useValue: {
          user: signal({ id: 1, loginId: 'owner' }), message: signal(''),
          check: () => of({ id: 1, loginId: 'owner' }),
        } },
        provideRouter(routes),
        {
          provide: ParkService,
          useValue: {
            createPark: () => of({ id: 1 }),
            uploadPhoto: () => of({ id: 10, url: '/api/parks/1/photos/10/image' }),
            updateFacility: () => of(null),
            getParks: () => of([{ id: 1, name: '中央公園', address: '東京都' }]),
            getPark: (id: string) => id === '1'
              ? of({ id: 1, name: '中央公園', address: '東京都', latitude: null, longitude: null, photos: [], facilities: [
                  { type: 'TOILET', status: 'EXISTS', lastCheckedOn: '2026-09-01' },
                  { type: 'DIAPER_CHANGING', status: 'UNKNOWN', lastCheckedOn: null },
                  { type: 'PARKING', status: 'NOT_EXISTS', lastCheckedOn: '2026-09-02' },
                  { type: 'PLAYGROUND', status: 'UNKNOWN', lastCheckedOn: null },
                ] })
              : throwError(() => ({ status: 404 })),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the park list', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('公園一覧');
    expect(compiled.querySelector('li h2')?.textContent).toBe('中央公園');
    expect(compiled.querySelector('li p')?.textContent).toBe('東京都');
    expect(TestBed.inject(Router).url).toBe('/parks');
    expect(compiled.querySelector('li a')?.getAttribute('href')).toBe('/parks/1');
  });

  it('should create a park without coordinates and navigate to its details', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/parks/new');
    await fixture.whenStable();
    const save = vi.spyOn(TestBed.inject(ParkService), 'createPark');
    const root = fixture.nativeElement as HTMLElement;
    for (const [name, value] of [['name', ' 中央公園 '], ['address', ' 東京都 ']]) {
      const input = root.querySelector(`input[name="${name}"]`) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    await fixture.whenStable();
    root.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(save).toHaveBeenCalledWith({ name: '中央公園', address: '東京都', latitude: null, longitude: null });
    expect(router.url).toBe('/parks/1');
  });

  it('should append a photo without resetting facility edits', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/parks/1');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const date = root.querySelector('form input') as HTMLInputElement;
    date.value = '2026-09-11';
    date.dispatchEvent(new Event('input'));
    const input = root.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    (root.querySelector('section button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(root.querySelector('.photos img')?.getAttribute('src')).toBe('/api/parks/1/photos/10/image');
    expect(date.value).toBe('2026-09-11');
    expect(input.value).toBe('');
  });

  it('should disable the saving row and retain input after a failed save', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/parks/1');
    await fixture.whenStable();
    const response = new Subject<ParkFacility>();
    const save = vi.spyOn(TestBed.inject(ParkService), 'updateFacility').mockReturnValue(response);
    const root = fixture.nativeElement as HTMLElement;
    const form = root.querySelector('form')!;
    const editor = root.querySelector('.facility-editor') as HTMLDetailsElement;
    expect(editor.open).toBe(false);
    expect(editor.querySelectorAll('summary').length).toBe(1);
    expect(editor.querySelectorAll('form').length).toBe(4);
    editor.querySelector('summary')!.click();
    expect(editor.open).toBe(true);
    const date = form.querySelector('input')!;
    date.value = '2026-09-11';
    date.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(save).toHaveBeenCalledWith(1, 'TOILET', { status: 'EXISTS', lastCheckedOn: '2026-09-11' });
    expect(date.disabled).toBe(true);
    expect(form.querySelector('button')!.disabled).toBe(true);
    expect(root.querySelectorAll('form input')[1].hasAttribute('disabled')).toBe(false);
    response.error({ status: 500 });
    await fixture.whenStable();
    expect(date.value).toBe('2026-09-11');
    expect(date.disabled).toBe(false);
    expect(form.querySelector('[role="alert"]')).not.toBeNull();

    save.mockReturnValue(of({ type: 'TOILET', status: 'EXISTS', lastCheckedOn: '2026-09-11' }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(root.querySelector('.facilities li')!.textContent).toContain('最終確認日：2026-09-11');
    expect(form.querySelector('[role="status"]')!.textContent).toContain('更新しました');
  });

  it('should render details and handle a missing park on the same route', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/parks/1');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toBe('中央公園');
    expect(compiled.querySelector('p')?.textContent).toBe('東京都');
    expect(compiled.querySelector('main > a')?.getAttribute('href')).toBe('/parks');
    const facilities = compiled.querySelectorAll('.facilities li');
    expect(facilities.length).toBe(4);
    expect(Array.from(facilities, item => item.querySelector('h3')?.textContent))
      .toEqual(['トイレ', 'おむつ替え', '駐車場', '遊具']);
    expect(facilities[0].textContent).toContain('ある');
    expect(facilities[0].textContent).toContain('2026-09-01');
    expect(facilities[1].textContent).toContain('最終確認日：不明');
    expect(facilities[2].querySelector('p')?.textContent).toBe('ない');
    await router.navigateByUrl('/parks/999');
    await fixture.whenStable();
    expect(compiled.querySelector('[role="alert"]')?.textContent).toBe('公園が見つかりません。');
    expect(compiled.querySelector('h1')).toBeNull();
  });
});
