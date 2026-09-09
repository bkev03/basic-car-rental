import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  imports: [
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {}
