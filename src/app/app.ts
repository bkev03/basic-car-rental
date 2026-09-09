import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { Menu } from './shared/menu/menu';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RentalStore } from './shared/rental-store.service';

@Component({
  imports: [
    RouterOutlet,
    RouterLink,
    Menu,
    MatSidenav,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('basic-car-rental');

  constructor(rentalStore: RentalStore) {
    void rentalStore;
  }

  onToggleSidenav(sidenav: MatSidenav): void {
    sidenav.toggle();
  }
}
