import { Routes } from '@angular/router';
import { ParkCreate } from './park/park-create/park-create';

import { ParkList } from './park/park-list/park-list';
import { ParkDetail } from './park/park-detail/park-detail';

export const routes: Routes = [
  { path: '', redirectTo: 'parks', pathMatch: 'full' },
  { path: 'parks', component: ParkList },
  { path: 'parks/new', component: ParkCreate },
  { path: 'parks/:id', component: ParkDetail },
];
