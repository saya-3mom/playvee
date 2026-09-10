import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { of } from 'rxjs';
import { ParkService } from './park/park.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: ParkService,
          useValue: {
            getParks: () => of([{ id: 1, name: '中央公園', address: '東京都' }]),
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
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('公園一覧');
    expect(compiled.querySelector('li h2')?.textContent).toBe('中央公園');
    expect(compiled.querySelector('li p')?.textContent).toBe('東京都');
  });
});
