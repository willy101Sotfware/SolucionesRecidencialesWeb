import { AsyncPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf, AsyncPipe],
  template: `
    <aside class="sidebar">
      <div class="logo">
        <h2>Soluciones Residenciales</h2>
      </div>
      <nav class="nav-menu">
        <a routerLink="/companies" routerLinkActive="active" class="nav-item">
          <span class="icon">&#127970;</span>
          <span>Empresas</span>
        </a>
        <a routerLink="/buildings" routerLinkActive="active" class="nav-item">
          <span class="icon">&#127969;</span>
          <span>Edificios</span>
        </a>
        <a routerLink="/employees" routerLinkActive="active" class="nav-item">
          <span class="icon">&#128100;</span>
          <span>Empleados</span>
        </a>
        <a routerLink="/quotations" routerLinkActive="active" class="nav-item">
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
      background: linear-gradient(180deg, #1e3a5f 0%, #2c5282 100%);
      color: white;
      display: flex;
      flex-direction: column;
      padding: 20px 0;
    }
    .logo {
      padding: 0 20px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 20px;
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
  `]
})
export class SidebarComponent {
  constructor(public authService: AuthService) { }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}
