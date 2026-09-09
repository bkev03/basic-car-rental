import { CurrencyPipe, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatCard, MatCardModule } from '@angular/material/card';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  imports: [
    MatCard,
    MatCardModule,
    MatFormFieldModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
    CurrencyPipe,
    MatNativeDateModule
  ],
  selector: 'app-search',
  styleUrl: './search.scss',
  templateUrl: './search.html',
})
export class Search {
  readonly cars: Car[] = [];
  filteredCars: Car[] = [];
  loading = true;
  error = false;

  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor(private readonly http: HttpClient) {
    this.http.get<Car[]>('/cars.json').subscribe({
      next: cars => {
        this.cars.push(...cars);
        this.loading = false;
        this.updateResults();
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });

    this.range.valueChanges.subscribe(() => this.updateResults());
  }

  private updateResults(): void {
    const { start, end } = this.range.value;
    if (!start || !end) {
      this.filteredCars = [];
      return;
    }

    const selectedStart = this.toDateOnly(start);
    const selectedEnd = this.toDateOnly(end);
    this.filteredCars = this.cars.filter(car =>
      car.unavailablePeriods.every(period =>
        selectedEnd < this.toDateOnly(period.start) || selectedStart > this.toDateOnly(period.end)
      )
    );
  }

  private toDateOnly(value: Date | string): Date {
    if (typeof value === 'string') {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
}

interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  dailyPrice: number;
  unavailablePeriods: DatePeriod[];
}

interface DatePeriod {
  start: string;
  end: string;
}
