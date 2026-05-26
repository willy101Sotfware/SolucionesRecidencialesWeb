import { AsyncPipe, NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IdleTimeoutService } from '../../core/services/idle-timeout.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf, AsyncPipe],
  template: `
    <aside class="sidebar">
      <div class="logo">
        <img src="assets/Images/Logos/SOLUCIONES RECIDENCIALES FONDO NEGRO.png"
             alt="Soluciones Residenciales"
             class="sidebar-logo" />
        <h2>Soluciones Residenciales</h2>
      </div>
      <nav class="nav-menu">
        <a routerLink="/companies" routerLinkActive="active" class="nav-item" (click)="navigated.emit()">
          <span class="icon">&#127970;</span>
          <span>Empresas</span>
        </a>
        <a routerLink="/buildings" routerLinkActive="active" class="nav-item" (click)="navigated.emit()">
          <span class="icon">&#127969;</span>
          <span>Edificios</span>
        </a>
        <a routerLink="/employees" routerLinkActive="active" class="nav-item" (click)="navigated.emit()">
          <span class="icon">&#128100;</span>
          <span>Empleados</span>
        </a>
        <a routerLink="/quotations" routerLinkActive="active" class="nav-item" (click)="navigated.emit()">
          <span class="icon">&#128196;</span>
          <span>Cotizaciones</span>
        </a>
      </nav>
      <div class="logout-section" *ngIf="authService.currentUser$ | async">
        <button class="logout-btn" (click)="logout()">
          <span class="icon">&#128682;</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      min-width: 260px;
      background: linear-gradient(180deg, #1e3a5f 0%, #2c5282 100%);
      color: white;
      display: flex;
      flex-direction: column;
      padding: 20px 0;
      transition: transform 0.3s ease;
      z-index: 100;
    }

    .logo {
      padding: 0 20px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 20px;
      text-align: center;
    }

    .sidebar-logo {
      width: 180px;
      margin-bottom: 10px;
    }

    .logo h2 {
      font-size: 1.2rem;
      margin: 0;
      text-align: center;
    }

    .nav-menu {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 0 15px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 15px;
      color: rgba(255,255,255,0.9);
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.3s;
    }

    .nav-item:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    .nav-item.active {
      background: rgba(255,255,255,0.2);
      color: white;
    }

    .icon {
      font-size: 1.2rem;
    }

    .logout-section {
      padding: 20px 15px 0;
      border-top: 1px solid rgba(255,255,255,0.1);
      margin-top: 20px;
    }

    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 15px;
      background: rgba(255,255,255,0.1);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .logout-btn:hover {
      background: rgba(229, 62, 62, 0.8);
    }

    /* Mobile: sidebar as slide-in overlay */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        transform: translateX(-100%);
      }

      .sidebar.mobile-open {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent {
  @Output() navigated = new EventEmitter<void>();

  constructor(
    public authService: AuthService,
    private idleTimeout: IdleTimeoutService
  ) { }

  logout(): void {
    this.idleTimeout.stop();
    this.authService.logout();
    window.location.href = '/login';
  }
}
