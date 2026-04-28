import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { QuotationItemResponse, CreateQuotationItemRequest, UpdateQuotationItemRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class QuotationItemService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.getQuotationItemsUrl();
  }

  getAll(): Observable<QuotationItemResponse[]> {
    return this.http.get<QuotationItemResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<QuotationItemResponse> {
    return this.http.get<QuotationItemResponse>(`${this.apiUrl}/${id}`);
  }

  getByQuotationId(quotationId: number): Observable<QuotationItemResponse[]> {
    return this.http.get<QuotationItemResponse[]>(`${this.apiUrl}/by-quotation/${quotationId}`);
  }

  create(request: CreateQuotationItemRequest): Observable<number> {
    return this.http.post<number>(this.apiUrl, request);
  }

  update(id: number, request: UpdateQuotationItemRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
