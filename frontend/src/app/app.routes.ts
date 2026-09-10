import { Routes } from '@angular/router';

import { ParkList } from './park/park-list/park-list';
import { ParkDetail } from './park/park-detail/park-detail';

export const routes: Routes = [
  { path: '', redirectTo: 'parks', pathMatch: 'full' },
  { path: 'parks', component: ParkList },
  { path: 'parks/:id', component: ParkDetail },
];
