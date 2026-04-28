export interface CompanyResponse {
  idEmpresa: number;
  nombre: string;
  nit?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  activo?: number;
}

export interface CreateCompanyRequest {
  nombre: string;
  nit?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface UpdateCompanyRequest {
  idEmpresa: number;
  nombre: string;
  nit?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  activo?: number;
}
