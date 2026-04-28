import { Component } from '@angular/core';
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
      padding: 15px 25px;
      background: white;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e3a5f;
      margin: 0;
    }
    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .user-name {
      font-weight: 600;
      color: #2d3748;
    }
    .user-role {
      font-size: 0.85rem;
      color: #718096;
    }
  `]
})
export class HeaderComponent {
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
