import type { PointGroup } from "signature_pad";

export type ISignData = {
  stroke: Array<PointGroup>;
  dataUrl: string;
};

export type ISignature = {
  signData: ISignData;
  width: number;
  height: number;
  left: number;
  top: number;
  angle: number;
  scaleX: number;
  scaleY: number;
};
