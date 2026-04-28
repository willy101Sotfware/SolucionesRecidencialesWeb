import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeResponse } from '../../../../core/models';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>Lista de Empleados</h2>
        <a routerLink="/employees/new" class="btn btn-primary"><span>+ Nuevo Empleado</span></a>
      </div>
      <div class="loading" *ngIf="isLoading"><p>Cargando empleados...</p></div>
      <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>
      <div class="table-container" *ngIf="!isLoading && !errorMessage">
        <table class="data-table">
          <thead>
            <tr>
              <th>Documento</th>
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Edificio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let employee of employees">
              <td>{{ employee.numeroDocumento || '-' }}</td>
              <td>{{ employee.nombreCompleto }}</td>
              <td>{{ employee.email || '-' }}</td>
              <td>{{ employee.telefono || '-' }}</td>
              <td>{{ employee.buildingName || '-' }}</td>
              <td><span class="badge" [class.active]="employee.activo === 1" [class.inactive]="employee.activo !== 1">{{ employee.activo === 1 ? 'Activo' : 'Inactivo' }}</span></td>
              <td class="actions">
                <a [routerLink]="['/employees/edit', employee.idEmpleado]" class="btn btn-sm btn-edit">Editar</a>
                <button class="btn btn-sm btn-delete" (click)="deleteEmployee(employee.idEmpleado)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="empty-state" *ngIf="employees.length === 0"><p>No hay empleados registrados.</p><a routerLink="/employees/new" class="btn btn-primary">Crear primer empleado</a></div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 20px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    .page-header h2 { margin: 0; color: #1e3a5f; }
    .btn { padding: 10px 20px; border-radius: 6px; text-decoration: none; cursor: pointer; border: none; font-size: 0.9rem; }
    .btn-primary { background: #2c5282; color: white; }
    .btn-sm { padding: 6px 12px; font-size: 0.8rem; }
    .btn-edit { background: #3182ce; color: white; margin-right: 5px; }
    .btn-delete { background: #e53e3e; color: white; }
    .table-container { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background: #f7fafc; padding: 15px; text-align: left; font-weight: 600; color: #2d3748; border-bottom: 2px solid #e2e8f0; }
    .data-table td { padding: 15px; border-bottom: 1px solid #e2e8f0; color: #4a5568; }
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; }
    .badge.active { background: #c6f6d5; color: #22543d; }
    .badge.inactive { background: #fed7d7; color: #742a2a; }
    .actions { display: flex; gap: 5px; }
    .loading { text-align: center; padding: 40px; color: #718096; }
    .error-message { background: #fed7d7; color: #c53030; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .empty-state { text-align: center; padding: 60px 20px; color: #718096; }
  `]
})
export class EmployeeListComponent implements OnInit {
  employees: EmployeeResponse[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void { this.loadEmployees(); }

  loadEmployees(): void {
    this.isLoading = true;
    this.employeeService.getAll().subscribe({
      next: (data: EmployeeResponse[]) => { this.employees = data; this.isLoading = false; },
      error: (error: unknown) => { this.isLoading = false; this.errorMessage = 'Error al cargar los empleados.'; console.error(error); }
    });
  }

  deleteEmployee(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este empleado?')) {
      this.employeeService.delete(id).subscribe({
        next: () => this.loadEmployees(),
        error: (error: unknown) => { console.error(error); alert('Error al eliminar el empleado.'); }
      });
    }
  }
}
