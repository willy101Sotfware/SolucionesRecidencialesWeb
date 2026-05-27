import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, timeout, throwError, timer } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { ApiConfigService } from './api-config.service';
import { LoginRequest, LoginResponse, UserResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl: string;
  private currentUserSubject = new BehaviorSubject<UserResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.getUsersUrl();
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      // 45s timeout — enough for Azure cold start (~15-30s), prevents hanging forever
      timeout(45000),
      // Retry up to 2 more times (3 total) with exponential backoff
      // Only retry on timeout or server errors (5xx), NOT on bad credentials (401/403)
      retry({
        count: 2,
        delay: (error: HttpErrorResponse, retryCount: number) => {
          if (error.status === 401 || error.status === 403) {
            // Wrong credentials — don't retry, fail immediately
            return throwError(() => error);
          }
          // Exponential backoff: 2s, 4s, 8s (capped)
          const delayMs = Math.min(1000 * Math.pow(2, retryCount), 8000);
          return timer(delayMs);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // Enrich the error so login component can show a better message
        if (error.name === 'TimeoutError' || error.status === 0) {
          return throwError(() => ({
            ...error,
            isServerDown: true
          }));
        }
        return throwError(() => error);
      }),
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): UserResponse | null {
    return this.currentUserSubject.value;
  }
}
