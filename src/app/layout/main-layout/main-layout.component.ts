import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { IdleTimeoutService } from '../../core/services/idle-timeout.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-container">
      <!-- Mobile overlay backdrop -->
      <div class="sidebar-overlay" [class.active]="sidebarOpen" (click)="sidebarOpen = false"></div>

      <!-- Sidebar -->
      <app-sidebar [class.mobile-open]="sidebarOpen" (navigated)="sidebarOpen = false"></app-sidebar>

      <!-- Main content area -->
      <div class="main-content">
        <app-header (menuToggle)="sidebarOpen = !sidebarOpen"></app-header>
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      height: 100vh;
      position: relative;
    }

    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 90;
    }
    .sidebar-overlay.active {
      display: block;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }

    .content-area {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background-color: #f5f5f5;
    }

    /* Tablet */
    @media (max-width: 1024px) {
      .content-area {
        padding: 16px;
      }
    }

    /* Mobile */
    @media (max-width: 768px) {
      .content-area {
        padding: 12px;
      }
    }
  `]
})
export class MainLayoutComponent {
  sidebarOpen = false;

  constructor(private idleTimeout: IdleTimeoutService) {}

  ngOnInit(): void {
    this.idleTimeout.init();
  }

  ngOnDestroy(): void {
    this.idleTimeout.stop();
  }
}
