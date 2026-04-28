export interface EmployeeResponse {
  idEmpleado: number;
  numeroDocumento?: string;
  nombreCompleto: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  barrio?: string;
  fechaIngreso?: string;
  activo?: number;
  buildingId?: number;
  buildingName?: string;
}

export interface CreateEmployeeRequest {
  numeroDocumento?: string;
  nombreCompleto: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  barrio?: string;
  fechaIngreso?: string;
  buildingId?: number;
}

export interface UpdateEmployeeRequest {
  idEmpleado: number;
  numeroDocumento?: string;
  nombreCompleto: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  barrio?: string;
  fechaIngreso?: string;
  activo?: number;
  buildingId?: number;
}
