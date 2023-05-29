import { IPago } from "./cartaPagoInterface";

export interface IPFEPrograma {
  Pagos?: IPago[];
  Id?: number;
  Anio: number;
  Periodo: number;
  EmpresaId: number;
}

export interface IPFEProgramaPagos {
  ProgramaId: number;
  PagoId: number;
}

export interface IPFETiposCambio {
  Id: number;
  ProgramaId: number;
  MonedaId: number;
  TipoCambio: number;
}
