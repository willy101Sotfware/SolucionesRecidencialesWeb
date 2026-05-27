import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, timer, timeout } from 'rxjs';
import { tap, retryWhen, concatMap, catchError } from 'rxjs/operators';
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
      // 45s timeout — enough for Azure cold start (~15-30s)
      timeout(45000),
      // Retry up to 2 more times (3 total) with exponential backoff
      // Only retries on timeout/network/server errors, NOT on 401/403
      retryWhen((errors: Observable<HttpErrorResponse>) =>
        errors.pipe(
          concatMap((error: HttpErrorResponse, attempt: number) => {
            // Wrong credentials — stop retrying immediately
            if (error.status === 401 || error.status === 403) {
              return throwError(() => error);
            }
            // Give up after 3 total attempts
            if (attempt >= 2) {
              return throwError(() => error);
            }
            // Exponential backoff: 2s, 4s
            const delayMs = Math.min(1000 * Math.pow(2, attempt), 8000);
            return timer(delayMs);
          })
        )
      ),
      // Enrich error so login component shows the right message
      catchError((error: any) => {
        if (error.name === 'TimeoutError' || error.status === 0) {
          // Server is down/cold-starting — add flag for the UI
          return throwError(() => Object.assign({}, error, { isServerDown: true }));
        }
        return throwError(() => error);
      }),
      // Store token and user on success
      tap((response: LoginResponse) => {
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
