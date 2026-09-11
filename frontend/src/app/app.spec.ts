import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { of, throwError } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { ParkService } from './park/park.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        {
          provide: ParkService,
          useValue: {
            getParks: () => of([{ id: 1, name: '中央公園', address: '東京都' }]),
            getPark: (id: string) => id === '1'
              ? of({ id: 1, name: '中央公園', address: '東京都', facilities: [
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

  it('should render details and handle a missing park on the same route', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/parks/1');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toBe('中央公園');
    expect(compiled.querySelector('p')?.textContent).toBe('東京都');
    expect(compiled.querySelector('a')?.getAttribute('href')).toBe('/parks');
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
