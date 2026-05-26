import { Component, OnInit, OnDestroy } from '@angular/core';
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
      <app-sidebar></app-sidebar>
      <div class="main-content">
        <app-header></app-header>
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
    }
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .content-area {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background-color: #f5f5f5;
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  constructor(private idleTimeout: IdleTimeoutService) {}

  ngOnInit(): void {
    this.idleTimeout.init();
  }

  ngOnDestroy(): void {
    this.idleTimeout.stop();
  }
}
