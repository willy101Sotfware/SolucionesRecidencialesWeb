import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BuildingResponse } from '../../../../core/models';
import { BuildingService } from '../../services/building.service';

@Component({
  selector: 'app-building-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>Lista de Edificios</h2>
        <a routerLink="/buildings/new" class="btn btn-primary">
          <span>+ Nuevo Edificio</span>
        </a>
      </div>
      <div class="loading" *ngIf="isLoading"><p>Cargando edificios...</p></div>
      <div class="error-message" *ngIf="errorMessage && errorMessage.length > 0">{{ errorMessage }}</div>
      <div class="table-container" *ngIf="!isLoading">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Ciudad</th>
              <th>Dirección</th>
              <th>Empresa</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let building of buildings">
              <td>{{ building.nombre }}</td>
              <td>{{ building.ciudad || '-' }}</td>
              <td>{{ building.direccion || '-' }}</td>
              <td>{{ building.companyName || '-' }}</td>
              <td><span class="badge" [class.active]="building.activo === 1" [class.inactive]="building.activo !== 1">{{ building.activo === 1 ? 'Activo' : 'Inactivo' }}</span></td>
              <td class="actions">
                <a [routerLink]="['/buildings/edit', building.idEdificio]" class="btn btn-sm btn-edit">Editar</a>
                <button class="btn btn-sm btn-delete" (click)="deleteBuilding(building.idEdificio)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="empty-state" *ngIf="buildings.length === 0">
          <p>No hay edificios registrados.</p>
          <a routerLink="/buildings/new" class="btn btn-primary">Crear primer edificio</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 20px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    .page-header h2 { margin: 0; color: #1e3a5f; }
    .btn { padding: 10px 20px; border-radius: 6px; text-decoration: none; cursor: pointer; border: none; font-size: 0.9rem; transition: all 0.3s; }
    .btn-primary { background: #2c5282; color: white; }
    .btn-primary:hover { background: #1e3a5f; }
    .btn-sm { padding: 6px 12px; font-size: 0.8rem; }
    .btn-edit { background: #3182ce; color: white; margin-right: 5px; }
    .btn-delete { background: #e53e3e; color: white; }
    .table-container { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background: #f7fafc; padding: 15px; text-align: left; font-weight: 600; color: #2d3748; border-bottom: 2px solid #e2e8f0; }
    .data-table td { padding: 15px; border-bottom: 1px solid #e2e8f0; color: #4a5568; }
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; }
    .badge.active { background: #c6f6d5; color: #22543d; }
    .badge.inactive { background: #fed7d7; color: #742a2a; }
    .actions { display: flex; gap: 5px; }
    .loading { text-align: center; padding: 40px; color: #718096; }
    .error-message { background: #fed7d7; color: #c53030; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .empty-state { text-align: center; padding: 60px 20px; color: #718096; }
  `]
})
export class BuildingListComponent implements OnInit {
  buildings: BuildingResponse[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private buildingService: BuildingService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void { this.loadBuildings(); }

  loadBuildings(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.buildingService.getAll().subscribe({
      next: (data: BuildingResponse[]) => { 
        this.buildings = data; 
        this.isLoading = false; 
        this.cdr.detectChanges(); 
      },
      error: (error: unknown) => { 
        this.isLoading = false; 
        this.errorMessage = 'Error al cargar los edificios.'; 
        this.cdr.detectChanges();
        console.error(error); 
      }
    });
  }

  deleteBuilding(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este edificio?')) {
      this.buildingService.delete(id).subscribe({
        next: () => this.loadBuildings(),
        error: (error: unknown) => { console.error(error); alert('Error al eliminar el edificio.'); }
      });
    }
  }
}
