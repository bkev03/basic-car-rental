import { CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Car, RentalOrder, RentalStore } from '../../shared/rental-store.service';

@Component({
  imports: [
    CurrencyPipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  selector: 'app-admin',
  styleUrl: './admin.scss',
  templateUrl: './admin.html',
})
export class Admin {
  readonly loginForm = new FormGroup({
    username: new FormControl('admin', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  orders: RentalOrder[] = [];
  cars: Car[] = [];
  loginError = '';
  carError = '';
  loading = false;
  loggedIn = false;
  passwordCopied = false;
  ordersLoading = false;
  carsLoading = false;
  carFormVisible = false;
  editingCarId: number | string | null = null;
  selectedImage = '';

  readonly carForm = new FormGroup({
    brand: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    model: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    year: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(1900)] }),
    dailyPrice: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(1)] }),
  });

  constructor(
    private readonly rentalStore: RentalStore,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  get adminUsername(): string {
    return this.rentalStore.adminUsername;
  }

  get adminPassword(): string {
    return this.rentalStore.adminPassword;
  }

  async copyPassword(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.adminPassword);
      this.passwordCopied = true;
    } catch {
      this.passwordCopied = false;
    }
  }

  login(): void {
    this.loginError = '';
    this.orders = [];
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const credentials = this.loginForm.getRawValue();
    if (!this.rentalStore.authenticate(credentials.username, credentials.password)) {
      this.loading = false;
      this.loginError = 'Invalid username or password.';
      return;
    }

    this.loggedIn = true;
    this.loading = false;
    this.loadOrders();
    this.loadCars();
  }

  logout(): void {
    this.loggedIn = false;
    this.orders = [];
    this.cars = [];
    this.ordersLoading = false;
    this.carsLoading = false;
    this.closeCarForm();
    this.loginForm.controls.password.reset();
  }

  refreshOrders(): void {
    this.loadOrders();
  }

  deleteOrder(order: RentalOrder): void {
    this.rentalStore.deleteOrder(order.id).subscribe({
      next: () => {
        this.orders = this.orders.filter(savedOrder => savedOrder.id !== order.id);
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.loginError = 'The booking could not be deleted.';
        this.changeDetector.detectChanges();
      }
    });
  }

  showAddCarForm(): void {
    this.editingCarId = null;
    this.selectedImage = '';
    this.carError = '';
    this.carForm.reset();
    this.carFormVisible = true;
  }

  editCar(car: Car): void {
    this.editingCarId = car.id;
    this.carError = '';
    this.carForm.patchValue({
      brand: car.brand,
      model: car.model,
      year: car.year,
      dailyPrice: car.dailyPrice,
    });
    this.selectedImage = car.image ?? '';
    this.carFormVisible = true;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImage = typeof reader.result === 'string' ? reader.result : '';
      this.changeDetector.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  closeCarForm(): void {
    this.carFormVisible = false;
    this.editingCarId = null;
    this.selectedImage = '';
    this.carError = '';
    this.carForm.reset();
  }

  saveCar(): void {
    this.carError = '';
    if (this.carForm.invalid) {
      this.carForm.markAllAsTouched();
      return;
    }

    const values = this.carForm.getRawValue();
    const existingCar = this.cars.find(car => car.id === this.editingCarId);
    const carData = {
      brand: values.brand,
      model: values.model,
      year: values.year!,
      dailyPrice: values.dailyPrice!,
        ...(this.selectedImage ? { image: this.selectedImage } : {}),
      unavailablePeriods: existingCar?.unavailablePeriods ?? [],
    };

    const request = this.editingCarId === null
      ? this.rentalStore.addCar(carData)
      : this.rentalStore.updateCar({ id: this.editingCarId, ...carData });

    request.subscribe({
      next: savedCar => {
        if (this.editingCarId === null) {
          this.cars = [...this.cars, savedCar];
        } else {
          this.cars = this.cars.map(car => car.id === savedCar.id ? savedCar : car);
        }
        this.closeCarForm();
      },
      error: () => this.carError = 'The car could not be saved. Start the mock server first.'
    });
  }

  private loadOrders(): void {
    this.ordersLoading = true;
    this.rentalStore.getOrders().subscribe({
      next: orders => {
        this.orders = orders;
        this.ordersLoading = false;
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.loginError = 'The booking service is not available. Start the mock server first.';
        this.loading = false;
        this.ordersLoading = false;
        this.changeDetector.detectChanges();
      }
    });
  }

  private loadCars(): void {
    this.carsLoading = true;
    this.rentalStore.getCars().subscribe({
      next: cars => {
        this.cars = cars;
        this.carsLoading = false;
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.carError = 'The cars could not be loaded. Start the mock server first.';
        this.carsLoading = false;
        this.changeDetector.detectChanges();
      }
    });
  }
}