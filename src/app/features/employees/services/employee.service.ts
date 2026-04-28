import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmployeeService as CoreEmployeeService } from '../../../core/services/employee.service';
import { EmployeeResponse, CreateEmployeeRequest, UpdateEmployeeRequest } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  constructor(private coreService: CoreEmployeeService) {}
  getAll(): Observable<EmployeeResponse[]> { return this.coreService.getAll(); }
  getById(id: number): Observable<EmployeeResponse> { return this.coreService.getById(id); }
  create(request: CreateEmployeeRequest): Observable<number> { return this.coreService.create(request); }
  update(id: number, request: UpdateEmployeeRequest): Observable<void> { return this.coreService.update(id, request); }
  delete(id: number): Observable<void> { return this.coreService.delete(id); }
}
