import { QuotationItemResponse } from './quotation-item.model';

export interface QuotationResponse {
  id: number;
  numero: string;
  fecha?: string;
  createdAt?: string;
  idEdificio?: number;
  buildingName?: string;
  asunto?: string;
  cordialSaludo?: string;
  headerPropuesta?: string;
  descripcionObra?: string;
  valorObra?: number;
  porcentajeUtilidad?: number;
  utilidad?: number;
  porcentajeIva?: number;
  ivaUtilidad?: number;
  iva?: number;
  total?: number;
  plazoEjecucion?: string;
  notaPie?: string;
  firmaNombre?: string;
  firmaCargo?: string;
  firmaCelular?: string;
  plazoEntrega?: string;
  showPlazo: number;
  garantia?: string;
  showGarantia: number;
  quotationItems?: QuotationItemResponse[];
}

export interface CreateQuotationRequest {
  numero: string;
  fecha?: string;
  idEdificio?: number;
  asunto?: string;
  cordialSaludo?: string;
  headerPropuesta?: string;
  descripcionObra?: string;
  valorObra?: number;
  porcentajeUtilidad?: number;
  utilidad?: number;
  porcentajeIva?: number;
  ivaUtilidad?: number;
  total?: number;
  notaPie?: string;
  firmaNombre?: string;
  firmaCargo?: string;
  firmaCelular?: string;
  plazoEntrega?: string;
  showPlazo: number;
  garantia?: string;
  showGarantia: number;
}

export interface UpdateQuotationRequest {
  id: number;
  numero: string;
  fecha?: string;
  idEdificio?: number;
  asunto?: string;
  cordialSaludo?: string;
  headerPropuesta?: string;
  descripcionObra?: string;
  valorObra?: number;
  porcentajeUtilidad?: number;
  utilidad?: number;
  porcentajeIva?: number;
  ivaUtilidad?: number;
  total?: number;
  notaPie?: string;
  firmaNombre?: string;
  firmaCargo?: string;
  firmaCelular?: string;
  plazoEntrega?: string;
  showPlazo: number;
  garantia?: string;
  showGarantia: number;
}
