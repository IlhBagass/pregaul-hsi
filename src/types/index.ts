export interface PregaulRow {
  service_no: number;
  reported_date: Date;
}

export interface IBoosterRow {
  nd: number;
  onu_link_status: string;
}

export type IBoosterRowInput = IBoosterRow;

export interface LosResult {
  service_no: number;
  reported_date: string;
  onu_link_status: string;
  result: string;
}

export type SessionStep = "idle" | "awaiting_pregaul" | "awaiting_ibooster";

export interface SessionState {
  step: SessionStep;
  pregaulBuffer?: Buffer;
  iboosterBuffer?: Buffer;
}
