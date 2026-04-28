import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CompanyService as CoreCompanyService } from '../../../core/services/company.service';
import { CompanyResponse, CreateCompanyRequest, UpdateCompanyRequest } from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  constructor(private coreService: CoreCompanyService) {}

  getAll(): Observable<CompanyResponse[]> {
    return this.coreService.getAll();
  }

  getById(id: number): Observable<CompanyResponse> {
    return this.coreService.getById(id);
  }

  create(request: CreateCompanyRequest): Observable<number> {
    return this.coreService.create(request);
  }

  update(id: number, request: UpdateCompanyRequest): Observable<void> {
    return this.coreService.update(id, request);
  }

  delete(id: number): Observable<void> {
    return this.coreService.delete(id);
  }
}
