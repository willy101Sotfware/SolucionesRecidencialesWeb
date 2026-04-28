import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = environment.apiUrl;
  }

  getApiUrl(): string {
    return this.baseUrl;
  }

  getCompaniesUrl(): string {
    return `${this.baseUrl}/companies`;
  }

  getBuildingsUrl(): string {
    return `${this.baseUrl}/buildings`;
  }

  getEmployeesUrl(): string {
    return `${this.baseUrl}/employees`;
  }

  getQuotationsUrl(): string {
    return `${this.baseUrl}/quotations`;
  }

  getQuotationItemsUrl(): string {
    return `${this.baseUrl}/quotationItems`;
  }

  getUsersUrl(): string {
    return `${this.baseUrl}/users`;
  }
}
