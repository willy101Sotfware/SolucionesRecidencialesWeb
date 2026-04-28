export interface QuotationItemResponse {
  id: number;
  idCotizacion: number;
  descripcion: string;
  cantidad?: number;
  unidadMedida?: string;
  imagen?: string;
  valorUnitario?: number;
  valorTotal?: number;
  plazoEntrega?: string;
  showPlazo?: number;
  garantia?: string;
  showGarantia?: number;
}

export interface CreateQuotationItemRequest {
  idCotizacion: number;
  descripcion: string;
  cantidad?: number;
  unidadMedida?: string;
  imagen?: string;
  valorUnitario?: number;
  valorTotal?: number;
  plazoEntrega?: string;
  showPlazo?: number;
  garantia?: string;
  showGarantia?: number;
}

export interface UpdateQuotationItemRequest {
  id: number;
  idCotizacion: number;
  descripcion: string;
  cantidad?: number;
  unidadMedida?: string;
  imagen?: string;
  valorUnitario?: number;
  valorTotal?: number;
  plazoEntrega?: string;
  showPlazo?: number;
  garantia?: string;
  showGarantia?: number;
}
