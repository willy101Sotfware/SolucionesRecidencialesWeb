import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { EmployeeService } from '../../services/employee.service';
import { BuildingService } from '../../../buildings/services/building.service';
import { EmployeeResponse, BuildingResponse, CreateEmployeeRequest, UpdateEmployeeRequest } from '../../../../core/models';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgFor, AsyncPipe],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>{{ isEditMode ? 'Editar Empleado' : 'Nuevo Empleado' }}</h2>
        <a routerLink="/employees" class="btn btn-secondary">Volver al listado</a>
      </div>
      <div class="form-container">
        <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()" class="employee-form">
          <div class="form-row">
            <div class="form-group">
              <label for="numeroDocumento">Número de Documento</label>
              <input type="text" id="numeroDocumento" formControlName="numeroDocumento" />
            </div>
            <div class="form-group">
              <label for="nombreCompleto">Nombre Completo <span class="required">*</span></label>
              <input type="text" id="nombreCompleto" formControlName="nombreCompleto" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" formControlName="email" />
            </div>
            <div class="form-group">
              <label for="telefono">Teléfono</label>
              <input type="tel" id="telefono" formControlName="telefono" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="direccion">Dirección</label>
              <input type="text" id="direccion" formControlName="direccion" />
            </div>
            <div class="form-group">
              <label for="barrio">Barrio</label>
              <input type="text" id="barrio" formControlName="barrio" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="buildingId">Edificio</label>
              <select id="buildingId" formControlName="buildingId">
                <option value="">Seleccione un edificio</option>
                <option *ngFor="let building of buildings$ | async" [value]="building.idEdificio">{{ building.nombre }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="fechaIngreso">Fecha de Ingreso</label>
              <input type="date" id="fechaIngreso" formControlName="fechaIngreso" />
            </div>
          </div>
          <div class="form-group checkbox-group" *ngIf="isEditMode">
            <label><input type="checkbox" formControlName="activo"> Activo</label>
          </div>
          <div class="error-alert" *ngIf="errorMessage">{{ errorMessage }}</div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" routerLink="/employees">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="employeeForm.invalid || isLoading">
              <span *ngIf="!isLoading">{{ isEditMode ? 'Actualizar' : 'Guardar' }}</span>
              <span *ngIf="isLoading">Guardando...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 20px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    .page-header h2 { margin: 0; color: #1e3a5f; }
    .btn { padding: 10px 20px; border-radius: 6px; text-decoration: none; cursor: pointer; border: none; font-size: 0.9rem; }
    .btn-primary { background: #2c5282; color: white; }
    .btn-secondary { background: #e2e8f0; color: #4a5568; }
    .form-container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .employee-form { display: flex; flex-direction: column; gap: 20px; }
    .form-row { display: flex; gap: 20px; }
    .form-group { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .form-group label { font-weight: 500; color: #2d3748; }
    .required { color: #e53e3e; }
    .form-group input, .form-group select { padding: 12px; border: 2px solid #e2e8f0; border-radius: 6px; font-size: 1rem; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #2c5282; }
    .checkbox-group { flex-direction: row; align-items: center; }
    .error-alert { background: #fed7d7; color: #c53030; padding: 15px; border-radius: 6px; }
    .form-actions { display: flex; gap: 15px; justify-content: flex-end; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
  `]
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  employeeId?: number;
  isLoading = false;
  errorMessage = '';
  buildings$: Observable<BuildingResponse[]>;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private buildingService: BuildingService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.buildings$ = this.buildingService.getAll();
    this.employeeForm = this.fb.group({
      numeroDocumento: [''],
      nombreCompleto: ['', Validators.required],
      email: [''],
      telefono: [''],
      direccion: [''],
      barrio: [''],
      fechaIngreso: [new Date().toISOString().split('T')[0]],
      buildingId: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.employeeId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.employeeId;
    if (this.isEditMode) this.loadEmployee();
  }

  loadEmployee(): void {
    if (!this.employeeId) return;
    this.isLoading = true;
    this.employeeService.getById(this.employeeId).subscribe({
      next: (employee: EmployeeResponse) => {
        this.employeeForm.patchValue({ ...employee, activo: employee.activo === 1 });
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.errorMessage = 'Error al cargar el empleado.'; }
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditMode && this.employeeId) {
      const request: UpdateEmployeeRequest = { ...this.employeeForm.value, idEmpleado: this.employeeId, activo: this.employeeForm.value.activo ? 1 : 0 };
      this.employeeService.update(this.employeeId, request).subscribe({
        next: () => this.router.navigate(['/employees']),
        error: (err: unknown) => { this.isLoading = false; this.errorMessage = 'Error al actualizar el empleado.'; console.error(err); }
      });
    } else {
      const request: CreateEmployeeRequest = this.employeeForm.value;
      this.employeeService.create(request).subscribe({
        next: () => this.router.navigate(['/employees']),
        error: (err: unknown) => { this.isLoading = false; this.errorMessage = 'Error al crear el empleado.'; console.error(err); }
      });
    }
  }
}
