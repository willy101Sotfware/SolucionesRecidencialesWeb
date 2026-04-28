import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { QuotationResponse, CreateQuotationRequest, UpdateQuotationRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.getQuotationsUrl();
  }

  getAll(): Observable<QuotationResponse[]> {
    return this.http.get<QuotationResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<QuotationResponse> {
    return this.http.get<QuotationResponse>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateQuotationRequest): Observable<number> {
    return this.http.post<number>(this.apiUrl, request);
  }

  update(id: number, request: UpdateQuotationRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
