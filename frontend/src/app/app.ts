import { Component } from '@angular/core';
import { ParkList } from './park/park-list/park-list';

@Component({
  selector: 'app-root',
  imports: [ParkList],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
