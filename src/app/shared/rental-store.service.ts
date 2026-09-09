import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

export interface RentalOrder {
  id: number;
  carId: number | string;
  car: string;
  startDate: string;
  endDate: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  rentalDays: number;
  totalPrice: number;
}

export interface Car {
  id: number | string;
  brand: string;
  model: string;
  year: number;
  dailyPrice: number;
  unavailablePeriods: DatePeriod[];
}

export interface DatePeriod {
  start: string;
  end: string;
}

@Injectable({ providedIn: 'root' })
export class RentalStore {
  readonly adminUsername = 'admin';
  readonly adminPassword = this.createPassword();
  private readonly apiUrl = 'http://localhost:3001';

  constructor(private readonly http: HttpClient) {}

  getOrders(): Observable<RentalOrder[]> {
    return this.http.get<RentalOrder[]>(`${this.apiUrl}/orders`).pipe(timeout(3000));
  }

  getCars(): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.apiUrl}/cars`).pipe(timeout(3000));
  }

  authenticate(username: string, password: string): boolean {
    return username === this.adminUsername && password === this.adminPassword;
  }

  addOrder(order: Omit<RentalOrder, 'id'>): Observable<RentalOrder> {
    return this.http.post<RentalOrder>(`${this.apiUrl}/orders`, order).pipe(timeout(5000));
  }

  deleteOrder(orderId: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/orders/${orderId}`).pipe(timeout(5000));
  }

  addCar(car: Omit<Car, 'id'>): Observable<Car> {
    return this.http.post<Car>(`${this.apiUrl}/cars`, car).pipe(timeout(5000));
  }

  updateCar(car: Car): Observable<Car> {
    return this.http.patch<Car>(`${this.apiUrl}/cars/${car.id}`, car).pipe(timeout(5000));
  }

  private createPassword(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = new Uint32Array(10);
    crypto.getRandomValues(values);
    return Array.from(values, value => characters[value % characters.length]).join('');
  }
}