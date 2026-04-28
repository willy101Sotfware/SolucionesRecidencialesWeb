import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BuildingService as CoreBuildingService } from '../../../core/services/building.service';
import { BuildingResponse, CreateBuildingRequest, UpdateBuildingRequest } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class BuildingService {
  constructor(private coreService: CoreBuildingService) {}
  getAll(): Observable<BuildingResponse[]> { return this.coreService.getAll(); }
  getById(id: number): Observable<BuildingResponse> { return this.coreService.getById(id); }
  create(request: CreateBuildingRequest): Observable<number> { return this.coreService.create(request); }
  update(id: number, request: UpdateBuildingRequest): Observable<void> { return this.coreService.update(id, request); }
  delete(id: number): Observable<void> { return this.coreService.delete(id); }
}
