import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CompanyResponse } from '../../../../core/models';
import { CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>Lista de Empresas</h2>
        <a routerLink="/companies/new" class="btn btn-primary">
          <span>+ Nueva Empresa</span>
        </a>
      </div>

      <div class="loading" *ngIf="isLoading">
        <p>Cargando empresas...</p>
      </div>

      <div class="error-message" *ngIf="errorMessage && errorMessage.length > 0">
        {{ errorMessage }}
      </div>

      <div class="table-container" *ngIf="!isLoading">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>NIT</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let company of companies">
              <td>{{ company.nombre }}</td>
              <td>{{ company.nit || '-' }}</td>
              <td>{{ company.email || '-' }}</td>
              <td>{{ company.telefono || '-' }}</td>
              <td>{{ company.direccion || '-' }}</td>
              <td>
                <span class="badge" [class.active]="company.activo === 1" [class.inactive]="company.activo !== 1">
                  {{ company.activo === 1 ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="actions">
                <a [routerLink]="['/companies/edit', company.idEmpresa]" class="btn btn-sm btn-edit">
                  Editar
                </a>
                <button class="btn btn-sm btn-delete" (click)="deleteCompany(company.idEmpresa)">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="empty-state" *ngIf="companies.length === 0">
          <p>No hay empresas registradas.</p>
          <a routerLink="/companies/new" class="btn btn-primary">Crear primera empresa</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 20px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
    }
    .page-header h2 {
      margin: 0;
      color: #1e3a5f;
    }
    .btn {
      padding: 10px 20px;
      border-radius: 6px;
      text-decoration: none;
      cursor: pointer;
      border: none;
      font-size: 0.9rem;
      transition: all 0.3s;
    }
    .btn-primary {
      background: #2c5282;
      color: white;
    }
    .btn-primary:hover {
      background: #1e3a5f;
    }
    .btn-sm {
      padding: 6px 12px;
      font-size: 0.8rem;
    }
    .btn-edit {
      background: #3182ce;
      color: white;
      margin-right: 5px;
    }
    .btn-edit:hover {
      background: #2c5282;
    }
    .btn-delete {
      background: #e53e3e;
      color: white;
    }
    .btn-delete:hover {
      background: #c53030;
    }
    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th {
      background: #f7fafc;
      padding: 15px;
      text-align: left;
      font-weight: 600;
      color: #2d3748;
      border-bottom: 2px solid #e2e8f0;
    }
    .data-table td {
      padding: 15px;
      border-bottom: 1px solid #e2e8f0;
      color: #4a5568;
    }
    .data-table tr:hover {
      background: #f7fafc;
    }
    .badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge.active {
      background: #c6f6d5;
      color: #22543d;
    }
    .badge.inactive {
      background: #fed7d7;
      color: #742a2a;
    }
    .actions {
      display: flex;
      gap: 5px;
    }
    .loading {
      text-align: center;
      padding: 40px;
      color: #718096;
    }
    .error-message {
      background: #fed7d7;
      color: #c53030;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #718096;
    }
    .empty-state p {
      margin-bottom: 20px;
    }
  `]
})
export class CompanyListComponent implements OnInit {
  companies: CompanyResponse[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private companyService: CompanyService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.companyService.getAll().subscribe({
      next: (data: CompanyResponse[]) => {
        this.companies = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar las empresas. Por favor, intente nuevamente.';
        this.cdr.detectChanges();
        console.error('Error al cargar empresas:', error);
      }
    });
  }

  deleteCompany(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta empresa?')) {
      this.companyService.delete(id).subscribe({
        next: () => {
          this.loadCompanies();
        },
        error: (error) => {
          console.error('Error deleting company:', error);
          alert('Error al eliminar la empresa.');
        }
      });
    }
  }
}
