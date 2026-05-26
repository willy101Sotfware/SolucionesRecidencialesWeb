import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Subscription, fromEvent, merge } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IdleTimeoutService implements OnDestroy {
  private timeoutMinutes = 30;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private activitySub?: Subscription;
  private initialized = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  /** Inicia el monitoreo de inactividad. Debe llamarse después del login. */
  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Escuchar eventos de actividad del usuario
    this.activitySub = merge(
      fromEvent(document, 'mousedown'),
      fromEvent(document, 'keydown'),
      fromEvent(document, 'touchstart'),
      fromEvent(document, 'scroll'),
      fromEvent(document, 'mousemove')
    ).subscribe(() => this.resetTimer());

    this.resetTimer();
  }

  /** Detiene el monitoreo (llamar al hacer logout manual). */
  stop(): void {
    this.initialized = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.activitySub?.unsubscribe();
  }

  private resetTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.onTimeout();
    }, this.timeoutMinutes * 60 * 1000);
  }

  private onTimeout(): void {
    console.warn('Sesión cerrada por inactividad (30 minutos).');
    this.stop();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
