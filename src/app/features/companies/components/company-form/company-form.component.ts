import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { CompanyService } from '../../services/company.service';
import { CreateCompanyRequest, UpdateCompanyRequest, CompanyResponse } from '../../../../core/models';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>{{ isEditMode ? 'Editar Empresa' : 'Nueva Empresa' }}</h2>
        <a routerLink="/companies" class="btn btn-secondary">Volver al listado</a>
      </div>

      <div class="form-container">
        <form [formGroup]="companyForm" (ngSubmit)="onSubmit()" class="company-form">
          <div class="form-row">
            <div class="form-group">
              <label for="nombre">Nombre <span class="required">*</span></label>
              <input
                type="text"
                id="nombre"
                formControlName="nombre"
                placeholder="Nombre de la empresa"
                [class.error]="companyForm.get('nombre')?.invalid && companyForm.get('nombre')?.touched"
              />
              <div class="error-message" *ngIf="companyForm.get('nombre')?.invalid && companyForm.get('nombre')?.touched">
                El nombre es requerido
              </div>
            </div>

            <div class="form-group">
              <label for="nit">NIT</label>
              <input
                type="text"
                id="nit"
                formControlName="nit"
                placeholder="Número de NIT"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                formControlName="email"
                placeholder="Correo electrónico"
              />
            </div>

            <div class="form-group">
              <label for="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                formControlName="telefono"
                placeholder="Número de teléfono"
              />
            </div>
          </div>

          <div class="form-group full-width">
            <label for="direccion">Dirección</label>
            <textarea
              id="direccion"
              formControlName="direccion"
              placeholder="Dirección completa"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group checkbox-group" *ngIf="isEditMode">
            <label>
              <input type="checkbox" formControlName="activo" [value]="1">
              Activo
            </label>
          </div>

          <div class="error-alert" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" routerLink="/companies">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="companyForm.invalid || isLoading">
              <span *ngIf="!isLoading">{{ isEditMode ? 'Actualizar' : 'Guardar' }}</span>
              <span *ngIf="isLoading">Guardando...</span>
            </button>
          </div>
        </form>
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
    .btn-primary:hover:not(:disabled) {
      background: #1e3a5f;
    }
    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .btn-secondary {
      background: #e2e8f0;
      color: #4a5568;
    }
    .btn-secondary:hover {
      background: #cbd5e0;
    }
    .form-container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .company-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .form-row {
      display: flex;
      gap: 20px;
    }
    .form-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .form-group.full-width {
      width: 100%;
    }
    .form-group label {
      font-weight: 500;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .required {
      color: #e53e3e;
    }
    .form-group input,
    .form-group textarea {
      padding: 12px;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #2c5282;
    }
    .form-group input.error {
      border-color: #e53e3e;
    }
    .error-message {
      color: #e53e3e;
      font-size: 0.85rem;
    }
    .error-alert {
      background: #fed7d7;
      color: #c53030;
      padding: 15px;
      border-radius: 6px;
    }
    .checkbox-group {
      flex-direction: row;
      align-items: center;
    }
    .checkbox-group input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
  `]
})
export class CompanyFormComponent implements OnInit {
  companyForm: FormGroup;
  isEditMode = false;
  companyId?: number;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.companyForm = this.fb.group({
      nombre: ['', Validators.required],
      nit: [''],
      email: [''],
      telefono: [''],
      direccion: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.companyId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.companyId;

    if (this.isEditMode) {
      this.loadCompany();
    }
  }

  loadCompany(): void {
    if (!this.companyId) return;

    this.isLoading = true;
    this.companyService.getById(this.companyId).subscribe({
      next: (company) => {
        this.companyForm.patchValue({
          nombre: company.nombre,
          nit: company.nit || '',
          email: company.email || '',
          telefono: company.telefono || '',
          direccion: company.direccion || '',
          activo: company.activo === 1
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar la empresa.';
        console.error('Error loading company:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.companyForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditMode && this.companyId) {
      const request: UpdateCompanyRequest = {
        ...this.companyForm.value,
        idEmpresa: this.companyId,
        activo: this.companyForm.value.activo ? 1 : 0
      };

      this.companyService.update(this.companyId, request).subscribe({
        next: () => {
          this.router.navigate(['/companies']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Error al actualizar la empresa.';
        }
      });
    } else {
      const request: CreateCompanyRequest = this.companyForm.value;

      this.companyService.create(request).subscribe({
        next: () => {
          this.router.navigate(['/companies']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Error al crear la empresa.';
        }
      });
    }
  }
}
