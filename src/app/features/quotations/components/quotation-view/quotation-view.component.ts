import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import html2pdf from 'html2pdf.js';
import { QuotationResponse } from '../../../../core/models';
import { QuotationService } from '../../services';
import { QuotationItemService } from '../../services/quotation-item.service';

@Component({
  selector: 'app-quotation-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="quotation-view-container">
      <!-- Barra de Acciones -->
      <div class="action-bar">
        <button class="btn btn-secondary" routerLink="/quotations">
          ← Volver
        </button>
        <button class="btn btn-pdf" (click)="downloadPdf()" [disabled]="isLoading">
          📄 Descargar PDF
        </button>
      </div>

      <!-- Contenido de la Cotización -->
      <div *ngIf="isLoading" class="loading">Cargando cotización...</div>

      <div *ngIf="!isLoading && quotation" #quotationContent class="quotation-document">
        <!-- Header con Logo -->
        <div class="doc-header">
          <div class="logo-section">
            <div class="company-logo">
              <img src="assets/images/logo.png" alt="Soluciones Residenciales"
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
              <div class="logo-placeholder" style="display: none;">
                <span class="logo-icon">🏢</span>
                <h1 class="company-name">Soluciones Residenciales</h1>
              </div>
            </div>
            <div class="company-info">
              <p class="company-slogan">Soluciones profesionales para su hogar</p>
              <p class="company-contact">Tel: 304 5889873 | Email: solucionesresidencialeser@gmail.com</p>
            </div>
          </div>
        </div>

        <!-- Fecha y Número -->
        <div class="doc-meta">
          <div class="date">
            Medellín, {{ formatDate(quotation.createdAt ?? quotation.fecha ?? '') }}
          </div>
          <div class="quotation-number">
            {{ quotation.numero }}
          </div>
        </div>

        <!-- Datos del Cliente -->
        <div class="client-section">
          <p class="label">Señores</p>
          <p class="client-name">{{ quotation.buildingName }}</p>
        </div>

        <!-- Asunto -->
        <div class="subject-section">
          <p class="subject-label">Asunto: </p>
          <p class="subject-text">{{ quotation.asunto }}</p>
        </div>

        <!-- Saludo y Header -->
        <div class="greeting-section">
          <p>{{ quotation.cordialSaludo }}</p>
          <p class="proposal-text">{{ quotation.headerPropuesta }}</p>
        </div>

        <!-- Items de la Cotización -->
        <div class="items-section">
          <h3 class="section-title">DETALLE DE LA PROPUESTA</h3>

          <table class="items-table">
            <thead>
              <tr>
                <th class="col-img">IMG</th>
                <th class="col-num">#</th>
                <th class="col-desc">DESCRIPCIÓN</th>
                <th class="col-qty">CANT.</th>
                <th class="col-unit">UNIDAD</th>
                <th class="col-price">V. UNITARIO</th>
                <th class="col-total">V. TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of quotation.quotationItems; let i = index" class="item-row">
                <td class="col-img">
                  <div class="item-image-cell" *ngIf="item.imagen">
                    <img [src]="item.imagen" alt="Item {{ i + 1 }}" class="item-thumb" />
                  </div>
                  <span *ngIf="!item.imagen" class="no-image">-</span>
                </td>
                <td class="col-num">{{ i + 1 }}</td>
                <td class="col-desc">{{ item.descripcion }}</td>
                <td class="col-qty">{{ item.cantidad || '-' }}</td>
                <td class="col-unit">{{ item.unidadMedida || '-' }}</td>
                <td class="col-price">{{ formatCurrency(item.valorUnitario) }}</td>
                <td class="col-total">{{ formatCurrency(item.valorTotal) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cálculos Financieros (igual que WPF) -->
        <div class="financial-summary">
          <div class="fin-row">
            <span>Valor obra:</span>
            <span>{{ formatCurrency(quotation.valorObra) }}</span>
          </div>
          <div class="fin-row">
            <span>Utilidad {{ (quotation.porcentajeUtilidad || 0) * 100 }}%:</span>
            <span>{{ formatCurrency(quotation.utilidad) }}</span>
          </div>
          <div class="fin-row">
            <span>Valor del IVA sobre la utilidad {{ (quotation.porcentajeIva || 0) * 100 }}%:</span>
            <span>{{ formatCurrency(quotation.ivaUtilidad) }}</span>
          </div>
          <div class="fin-row total">
            <span>Valor total:</span>
            <span>{{ formatCurrency(quotation.total) }}</span>
          </div>
        </div>

        <!-- Plazo y Garantía -->
        <div class="terms-section">
          <div *ngIf="quotation.plazoEjecucion" class="term-item">
            <strong>Plazo de Ejecución:</strong> {{ quotation.plazoEjecucion }}
          </div>
          <div *ngIf="quotation.garantia" class="term-item">
            <strong>Garantía:</strong> {{ quotation.garantia }}
          </div>
        </div>

        <!-- Firma -->
        <div class="signature-section">
          <p class="signature-name">{{ quotation.firmaNombre }}</p>
          <p class="signature-role">{{ quotation.firmaCargo }}</p>
          <p class="signature-phone">{{ quotation.firmaCelular }}</p>
        </div>

        <!-- Nota Pie -->
        <div *ngIf="quotation.notaPie" class="footer-note">
          <p>{{ quotation.notaPie }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quotation-view-container {
      padding: 1.5rem;
      background: #f0f2f5;
      min-height: 100vh;
    }

    .action-bar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #1890ff;
      color: white;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      padding: 0.75rem 1.5rem;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
      transition: all 0.2s ease;
    }

    .btn-primary:hover:not(:disabled) {
      background: #40a9ff;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
    }

    .btn-pdf {
      background: linear-gradient(135deg, #FF453A 0%, #FF6B6B 100%);
      color: white;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(255, 69, 58, 0.3);
      transition: all 0.2s ease;
    }

    .btn-pdf:hover:not(:disabled) {
      background: linear-gradient(135deg, #FF6B6B 0%, #FF453A 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 69, 58, 0.4);
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #595959;
    }

    .btn-secondary:hover {
      background: #e8e8e8;
    }

    /* Logo de Empresa */
    .company-logo {
      text-align: center;
      margin-bottom: 10px;
    }

    .company-logo img {
      max-width: 200px;
      max-height: 100px;
      object-fit: contain;
    }

    .logo-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }

    .logo-icon {
      font-size: 48px;
    }

    .company-info {
      text-align: center;
      font-size: 10pt;
      color: #666;
      margin-top: 5px;
    }

    .company-slogan {
      font-style: italic;
      margin: 3px 0;
    }

    .company-contact {
      margin: 0;
      font-size: 9pt;
    }

    /* Imágenes de Ítems */
    .col-img {
      width: 60px;
      text-align: center;
    }

    .item-image-cell {
      width: 50px;
      height: 50px;
      border-radius: 4px;
      overflow: hidden;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }

    .item-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-image {
      color: #999;
      font-size: 10pt;
    }

    .item-row:hover {
      background-color: #f9f9f9;
    }

    .loading {
      text-align: center;
      padding: 3rem;
      font-size: 1.2rem;
      color: #595959;
    }

    .quotation-document {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      padding: 20mm;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-family: Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
    }

    .doc-header {
      border-bottom: 3px solid #1890ff;
      padding-bottom: 1rem;
      margin-bottom: 2rem;
    }

    .company-name {
      color: #1890ff;
      font-size: 24pt;
      margin: 0;
    }

    .doc-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2rem;
    }

    .date {
      color: #595959;
    }

    .quotation-number {
      font-size: 14pt;
      font-weight: bold;
      color: #1890ff;
    }

    .client-section {
      margin-bottom: 2rem;
    }

    .label {
      margin: 0;
      color: #595959;
    }

    .client-name {
      margin: 0.5rem 0;
      font-weight: bold;
      font-size: 12pt;
    }

    .client-nit, .client-address, .client-city {
      margin: 0.25rem 0;
    }

    .subject-section {
      margin-bottom: 1.5rem;
    }

    .subject-label {
      display: inline;
      font-weight: bold;
    }

    .subject-text {
      display: inline;
    }

    .greeting-section {
      margin-bottom: 2rem;
    }

    .proposal-text {
      text-align: justify;
    }

    .items-section {
      margin: 2rem 0;
    }

    .section-title {
      color: #1890ff;
      font-size: 12pt;
      border-bottom: 2px solid #1890ff;
      padding-bottom: 0.5rem;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }

    .items-table th {
      background: #1890ff;
      color: white;
      padding: 0.75rem;
      text-align: left;
      font-weight: bold;
    }

    .items-table td {
      padding: 0.75rem;
      border-bottom: 1px solid #e8e8e8;
    }

    .items-table tbody tr:hover {
      background: #f5f5f5;
    }

    .col-num { width: 5%; text-align: center; }
    .col-desc { width: 35%; }
    .col-qty { width: 10%; text-align: center; }
    .col-unit { width: 10%; }
    .col-price { width: 20%; text-align: right; }
    .col-total { width: 20%; text-align: right; font-weight: bold; }

    .financial-summary {
      width: 400px;
      margin: 2rem 0 2rem auto;
      padding: 1rem;
    }

    .fin-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      font-size: 11pt;
    }

    .fin-row.total {
      border-top: 2px solid #1890ff;
      margin-top: 0.5rem;
      padding-top: 1rem;
      font-weight: bold;
      font-size: 14pt;
      color: #1890ff;
    }

    .terms-section {
      margin: 2rem 0;
      padding: 1rem;
      background: #fafafa;
      border-left: 4px solid #1890ff;
    }

    .term-item {
      margin: 0.5rem 0;
    }

    .signature-section {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #e8e8e8;
    }

    .signature-name {
      font-weight: bold;
      margin: 0;
    }

    .signature-role, .signature-phone {
      margin: 0.25rem 0;
      color: #595959;
    }

    .footer-note {
      margin-top: 2rem;
      padding: 1rem;
      background: #fffbe6;
      border-left: 4px solid #faad14;
      font-size: 10pt;
    }
  `]
})
export class QuotationViewComponent implements OnInit {
  @ViewChild('quotationContent') quotationContent!: ElementRef;

  quotation: QuotationResponse | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quotationService: QuotationService,
    private quotationItemService: QuotationItemService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadQuotation(id);
  }

  loadQuotation(id: number): void {
    this.quotationService.getById(id).subscribe({
      next: (quotation: QuotationResponse) => {
        this.quotation = quotation;
        console.log('Cotización cargada:', quotation);
        // Cargar items de la cotización
        this.quotationItemService.getByQuotationId(id).subscribe({
          next: (items) => {
            console.log('Ítems cargados:', items);
            this.quotation!.quotationItems = items;
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (error: any) => {
            console.error('Error cargando items:', error);
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (error: any) => {
        console.error('Error cargando cotización:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatCurrency(value: number | null | undefined): string {
    if (!value) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  async downloadPdf(): Promise<void> {
    if (!this.quotationContent?.nativeElement) {
      console.error('No se puede descargar PDF: contenido no disponible');
      return;
    }

    const element = this.quotationContent.nativeElement;
    const edificioName = this.quotation?.buildingName?.replace(/\s+/g, '_') || 'documento';

    this.isLoading = true;

    // Esperar a que todas las imágenes se carguen
    const images = element.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
    const imagePromises = Array.from(images).map((img: HTMLImageElement) => {
      return new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Continuar aunque falle la imagen
        }
      });
    });

    // Esperar 500ms adicional para asegurar renderizado completo
    await Promise.all([...imagePromises, new Promise(r => setTimeout(r, 500))]);

    const opt: any = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `${this.quotation?.numero || 'cotizacion'}_${edificioName}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save()
      .then(() => {
        console.log('PDF descargado exitosamente');
        this.isLoading = false;
      })
      .catch((error: any) => {
        console.error('Error descargando PDF:', error);
        this.isLoading = false;
        alert('Error al generar el PDF. Intente nuevamente.');
      });
  }
}
