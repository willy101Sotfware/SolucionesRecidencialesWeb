import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <img src="assets/Images/Logos/SOLUCIONES RECIDENCIALES FONDO NEGRO.png"
               alt="Soluciones Residenciales"
               class="login-logo" />
          <h2>Soluciones Residenciales</h2>
          <p>Inicie sesión para continuar</p>
        </div>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="username">Usuario</label>
            <input
              type="text"
              id="username"
              formControlName="username"
              placeholder="Ingrese su usuario"
              [class.error]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched"
            />
            <div class="error-message" *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">
              El usuario es requerido
            </div>
          </div>
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              placeholder="Ingrese su contraseña"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            />
            <div class="error-message" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              La contraseña es requerida
            </div>
          </div>
          <div class="error-alert" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>
          <button type="submit" class="login-btn" [disabled]="loginForm.invalid || isLoading">
            <span *ngIf="!isLoading">Iniciar Sesión</span>
            <span *ngIf="isLoading">Cargando...</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
      padding: 20px;
    }

    .login-box {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 400px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .login-logo {
      width: 220px;
      margin-bottom: 15px;
    }

    .login-header h2 {
      color: #1e3a5f;
      margin: 0 0 10px 0;
    }

    .login-header p {
      color: #718096;
      margin: 0;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 500;
      color: #2d3748;
    }

    .form-group input {
      padding: 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #2c5282;
    }

    .form-group input.error {
      border-color: #e53e3e;
    }

    .error-message {
      color: #e53e3e;
      font-size: 0.85rem;
    }

    .error-alert {
      background: #fed7d7;
      color: #c53030;
      padding: 12px;
      border-radius: 8px;
      text-align: center;
    }

    .login-btn {
      background: linear-gradient(135deg, #2c5282 0%, #1e3a5f 100%);
      color: white;
      padding: 14px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(44, 82, 130, 0.3);
    }

    .login-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    /* Mobile */
    @media (max-width: 480px) {
      .login-container {
        padding: 16px;
        align-items: flex-start;
        padding-top: 40px;
      }

      .login-box {
        padding: 24px;
      }

      .login-logo {
        width: 180px;
      }

      .login-header h2 {
        font-size: 1.2rem;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Ping silencioso para despertar el backend mientras el usuario escribe
    // Azure App Service free/basic tier se duerme — esto lo despierta antes del login
    this.http.get(`${environment.apiUrl}/users`, { observe: 'response' }).pipe(
      timeout(10000),
      catchError(() => of(null))
    ).subscribe();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const request: LoginRequest = this.loginForm.value;

    this.authService.login(request).subscribe({
      next: () => {
        this.router.navigate(['/companies']);
      },
      error: (error: any) => {
        this.isLoading = false;
        if (error.isServerDown) {
          this.errorMessage = 'El servidor está iniciando (modo suspensión). Intente de nuevo en unos segundos.';
        } else if (error.status === 401) {
          this.errorMessage = 'Usuario o contraseña incorrectos.';
        } else if (error.status === 0 || error.name === 'TimeoutError') {
          this.errorMessage = 'El servidor no responde después de varios intentos. Intente de nuevo en unos segundos.';
        } else {
          this.errorMessage = error.error?.message || 'Error al iniciar sesión. Intente nuevamente.';
        }
      }
    });
  }
}
