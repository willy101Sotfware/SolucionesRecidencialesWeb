import { Component, EventEmitter, Output } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';
import { UserResponse } from '../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AsyncPipe, NgIf],
  template: `
    <header class="header">
      <div class="header-left">
        <button class="hamburger" (click)="menuToggle.emit()" aria-label="Menú">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h1 class="page-title">{{ getPageTitle() }}</h1>
      </div>
      <div class="header-right">
        <div class="user-info" *ngIf="currentUser$ | async as user">
          <span class="user-name">{{ user.nombreCompleto }}</span>
          <span class="user-role">{{ user.username }}</span>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 25px;
      background: white;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      flex-shrink: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Hamburger button — hidden on desktop */
    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
    }

    .hamburger span {
      display: block;
      width: 24px;
      height: 3px;
      background: #1e3a5f;
      border-radius: 2px;
      transition: all 0.3s;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e3a5f;
      margin: 0;
    }

    .header-right {
      display: flex;
      align-items: center;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .user-name {
      font-weight: 600;
      color: #2d3748;
      font-size: 0.95rem;
    }

    .user-role {
      font-size: 0.85rem;
      color: #718096;
    }

    /* Mobile */
    @media (max-width: 768px) {
      .header {
        padding: 10px 16px;
      }

      .hamburger {
        display: flex;
      }

      .page-title {
        font-size: 1.1rem;
      }

      .user-role {
        display: none;
      }

      .user-name {
        font-size: 0.85rem;
      }
    }
  `]
})
export class HeaderComponent {
  @Output() menuToggle = new EventEmitter<void>();
  currentUser$: Observable<UserResponse | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  getPageTitle(): string {
    const path = window.location.pathname;
    const titles: { [key: string]: string } = {
      '/companies': 'Gestión de Empresas',
      '/buildings': 'Gestión de Edificios',
      '/employees': 'Gestión de Empleados',
      '/quotations': 'Gestión de Cotizaciones',
      '/login': 'Iniciar Sesión'
    };
    return titles[path] || 'Dashboard';
  }
}
