import { CurrencyPipe, NgFor, NgIf, SlicePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuotationResponse } from '../../../../core/models';
import { QuotationService } from '../../services/quotation.service';

@Component({
  selector: 'app-quotation-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, CurrencyPipe, SlicePipe],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>Lista de Cotizaciones</h2>
        <a routerLink="/quotations/new" class="btn btn-primary"><span>+ Nueva Cotización</span></a>
      </div>
      <div class="loading" *ngIf="isLoading"><p>Cargando cotizaciones...</p></div>
      <div class="error-message" *ngIf="errorMessage && errorMessage.length > 0">{{ errorMessage }}</div>
      <div class="table-container" *ngIf="!isLoading">
        <table class="data-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha</th>
              <th>Edificio</th>
              <th>Descripción</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let quotation of quotations">
              <td>{{ quotation.numero }}</td>
              <td>{{ quotation.fecha || '-' }}</td>
              <td>{{ quotation.buildingName || '-' }}</td>
              <td>{{ quotation.descripcionObra || '-' | slice:0:50 }}{{ quotation.descripcionObra && quotation.descripcionObra.length > 50 ? '...' : '' }}</td>
              <td>{{ quotation.total | currency:'COP':'symbol':'1.0-0' }}</td>
              <td class="actions">
                <a [routerLink]="['/quotations/view', quotation.id]" class="btn btn-sm btn-view">Ver</a>
                <a [routerLink]="['/quotations/edit', quotation.id]" class="btn btn-sm btn-edit">Editar</a>
                <button class="btn btn-sm btn-delete" (click)="deleteQuotation(quotation.id)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="empty-state" *ngIf="quotations.length === 0"><p>No hay cotizaciones registradas.</p><a routerLink="/quotations/new" class="btn btn-primary">Crear primera cotización</a></div>
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
    .btn-view { background: #38a169; color: white; margin-right: 5px; }
    .btn-edit { background: #3182ce; color: white; margin-right: 5px; }
    .btn-delete { background: #e53e3e; color: white; }
    .table-container { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background: #f7fafc; padding: 15px; text-align: left; font-weight: 600; color: #2d3748; border-bottom: 2px solid #e2e8f0; }
    .data-table td { padding: 15px; border-bottom: 1px solid #e2e8f0; color: #4a5568; }
    .actions { display: flex; gap: 5px; }
    .loading { text-align: center; padding: 40px; color: #718096; }
    .error-message { background: #fed7d7; color: #c53030; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .empty-state { text-align: center; padding: 60px 20px; color: #718096; }
  `]
})
export class QuotationListComponent implements OnInit {
  quotations: QuotationResponse[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private quotationService: QuotationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void { this.loadQuotations(); }

  loadQuotations(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.quotationService.getAll().subscribe({
      next: (data: QuotationResponse[]) => { 
        this.quotations = data; 
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: unknown) => { 
        this.isLoading = false; 
        this.errorMessage = 'Error al cargar las cotizaciones.'; 
        this.cdr.detectChanges();
        console.error(error); 
      }
    });
  }

  deleteQuotation(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta cotización?')) {
      this.quotationService.delete(id).subscribe({
        next: () => this.loadQuotations(),
        error: (error: unknown) => { console.error(error); alert('Error al eliminar la cotización.'); }
      });
    }
  }
}
