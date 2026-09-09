import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [
    RouterLink, 
    RouterLinkActive,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  selector: 'app-page-not-found',
  styleUrl: './page-not-found.scss',
  templateUrl: './page-not-found.html',
})
export class PageNotFound {}
