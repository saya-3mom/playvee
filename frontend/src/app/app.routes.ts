import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth/auth.guard';
import { Login } from './auth/login';
import { ParkCreate } from './park/park-create/park-create';

import { ParkList } from './park/park-list/park-list';
import { ParkDetail } from './park/park-detail/park-detail';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: '', redirectTo: 'parks', pathMatch: 'full' },
  { path: 'parks', component: ParkList, canActivate: [authGuard] },
  { path: 'parks/new', component: ParkCreate, canActivate: [authGuard] },
  { path: 'parks/:id', component: ParkDetail, canActivate: [authGuard] },
  { path: '**', redirectTo: 'parks' },
];
