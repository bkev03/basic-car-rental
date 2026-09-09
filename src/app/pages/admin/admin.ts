import { CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RentalOrder, RentalStore } from '../../shared/rental-store.service';

@Component({
  imports: [
    CurrencyPipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
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
  loginError = '';
  loading = false;
  loggedIn = false;
  passwordCopied = false;
  ordersLoading = false;

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
  }

  logout(): void {
    this.loggedIn = false;
    this.orders = [];
    this.ordersLoading = false;
    this.loginForm.controls.password.reset();
  }

  refreshOrders(): void {
    this.loadOrders();
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
}