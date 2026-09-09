import { CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardModule } from '@angular/material/card';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Car, RentalOrder, RentalStore } from '../../shared/rental-store.service';

@Component({
  imports: [
    MatCard,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    CurrencyPipe,
    MatNativeDateModule
  ],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {
  readonly cars: Car[] = [];
  filteredCars: Car[] = [];
  loading = true;
  error = false;
  selectedCar: Car | null = null;
  orderSubmitted = false;
  bookingError = '';
  isSubmitting = false;
  private orders: RentalOrder[] = [];

  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  readonly bookingForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    address: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^\+?[0-9][0-9\s()-]{7,18}[0-9]$/)
      ]
    }),
  });

  constructor(
    private readonly rentalStore: RentalStore,
    private readonly changeDetector: ChangeDetectorRef
  ) {
    this.rentalStore.getCars().subscribe({
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

    this.rentalStore.getOrders().subscribe({
      next: orders => {
        this.orders = orders;
        this.updateResults();
      },
      error: () => this.bookingError = 'The booking service is not available.'
    });

    this.range.valueChanges.subscribe(() => {
      this.orderSubmitted = false;
      this.bookingError = '';
      this.updateResults();
    });
  }

  get rentalDays(): number {
    const { start, end } = this.range.value;
    if (!start || !end) {
      return 0;
    }

    return Math.max(0, Math.round((this.toDateOnly(end).getTime() - this.toDateOnly(start).getTime()) / 86400000));
  }

  get totalPrice(): number {
    return this.selectedCar ? this.selectedCar.dailyPrice * this.rentalDays : 0;
  }

  selectCar(car: Car): void {
    this.selectedCar = car;
    this.orderSubmitted = false;
    this.bookingError = '';
    this.bookingForm.reset();
  }

  submitBooking(): void {
    this.bookingError = '';
    this.orderSubmitted = false;
    if (this.isSubmitting) {
      return;
    }

    if (!this.selectedCar || this.rentalDays <= 0 || this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const order = {
      carId: this.selectedCar.id,
      car: `${this.selectedCar.brand} ${this.selectedCar.model}`,
      startDate: this.formatDate(this.range.value.start!),
      endDate: this.formatDate(this.range.value.end!),
      ...this.bookingForm.getRawValue(),
      rentalDays: this.rentalDays,
      totalPrice: this.totalPrice,
    };

    this.rentalStore.getOrders().subscribe({
      next: orders => {
        if (this.hasOverlappingOrder(this.selectedCar!.id, this.range.value.start!, this.range.value.end!, orders)) {
          this.bookingError = 'This car is no longer available for the selected period.';
          this.isSubmitting = false;
          this.changeDetector.detectChanges();
          return;
        }

        this.rentalStore.addOrder(order).subscribe({
          next: savedOrder => {
            this.orders = [...orders, savedOrder];
            this.orderSubmitted = true;
            this.isSubmitting = false;
            this.changeDetector.detectChanges();
          },
          error: () => {
            this.bookingError = 'The booking could not be submitted. Please try again.';
            this.isSubmitting = false;
            this.changeDetector.detectChanges();
          }
        });
      },
      error: () => {
        this.bookingError = 'The booking service is not available. Start the mock server first.';
        this.isSubmitting = false;
        this.changeDetector.detectChanges();
      }
    });
  }

  private updateResults(): void {
    const { start, end } = this.range.value;
    if (!start || !end || this.rentalDays <= 0) {
      this.filteredCars = [];
      this.selectedCar = null;
      return;
    }

    const selectedStart = this.toDateOnly(start);
    const selectedEnd = this.toDateOnly(end);
    this.filteredCars = this.cars.filter(car =>
      car.unavailablePeriods.every(period =>
        selectedEnd < this.toDateOnly(period.start) || selectedStart > this.toDateOnly(period.end)
      ) && !this.hasOverlappingOrder(car.id, start, end, this.orders)
    );

    if (this.selectedCar && !this.filteredCars.some(car => car.id === this.selectedCar?.id)) {
      this.selectedCar = null;
    }
  }

  private hasOverlappingOrder(carId: number | string, start: Date, end: Date, orders: RentalOrder[]): boolean {
    const selectedStart = this.toDateOnly(start);
    const selectedEnd = this.toDateOnly(end);

    return orders.some(order =>
      order.carId === carId &&
      selectedStart <= this.toDateOnly(order.endDate) &&
      selectedEnd >= this.toDateOnly(order.startDate)
    );
  }

  private formatDate(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toDateOnly(value: Date | string): Date {
    if (typeof value === 'string') {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
}


