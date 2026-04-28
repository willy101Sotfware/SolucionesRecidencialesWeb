import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { QuotationItemService as CoreQuotationItemService } from '../../../core/services/quotation-item.service';
import { QuotationItemResponse, CreateQuotationItemRequest, UpdateQuotationItemRequest } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class QuotationItemService {
  constructor(private coreService: CoreQuotationItemService) {}
  
  getAll(): Observable<QuotationItemResponse[]> { return this.coreService.getAll(); }
  getById(id: number): Observable<QuotationItemResponse> { return this.coreService.getById(id); }
  getByQuotationId(quotationId: number): Observable<QuotationItemResponse[]> { return this.coreService.getByQuotationId(quotationId); }
  create(request: CreateQuotationItemRequest): Observable<number> { return this.coreService.create(request); }
  update(id: number, request: UpdateQuotationItemRequest): Observable<void> { return this.coreService.update(id, request); }
  delete(id: number): Observable<void> { return this.coreService.delete(id); }
}
