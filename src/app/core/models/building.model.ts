export interface BuildingResponse {
  idEdificio: number;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
  nit?: string;
  activo?: number;
  companyId?: number;
  companyName?: string;
}

export interface CreateBuildingRequest {
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
  nit?: string;
  companyId?: number;
}

export interface UpdateBuildingRequest {
  idEdificio: number;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
  nit?: string;
  activo?: number;
  companyId?: number;
}
