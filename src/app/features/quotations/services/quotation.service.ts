import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { QuotationService as CoreQuotationService } from '../../../core/services/quotation.service';
import { QuotationResponse, CreateQuotationRequest, UpdateQuotationRequest } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class QuotationService {
  constructor(private coreService: CoreQuotationService) {}
  getAll(): Observable<QuotationResponse[]> { return this.coreService.getAll(); }
  getById(id: number): Observable<QuotationResponse> { return this.coreService.getById(id); }
  create(request: CreateQuotationRequest): Observable<number> { return this.coreService.create(request); }
  update(id: number, request: UpdateQuotationRequest): Observable<void> { return this.coreService.update(id, request); }
  delete(id: number): Observable<void> { return this.coreService.delete(id); }
}
