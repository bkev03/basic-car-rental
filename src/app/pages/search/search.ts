import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { MatCard, MatCardModule } from '@angular/material/card';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  imports: [
    RouterOutlet,
    RouterLink,
    MatCard,
    MatCardModule,
    MatFormFieldModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
    MatNativeDateModule
  ],
  selector: 'app-search',
  styleUrl: './search.scss',
  templateUrl: './search.html',
})
export class Search {
  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
}
