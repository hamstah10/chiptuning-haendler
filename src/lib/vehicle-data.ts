/** Illustrative Stage 1 example values for the landing page teaser – not live database values. */
export interface VehicleEngine {
  name: string;
  ps: number;
  nm: number;
  tps: number;
  tnm: number;
  options: string[];
}

export const VEHICLES: Record<string, Record<string, VehicleEngine[]>> = {
  BMW: {
    "3er G20": [
      { name: "320d 190 PS", ps: 190, nm: 400, tps: 235, tnm: 480, options: ["vmax", "dpf", "popcorn"] },
      { name: "330i 258 PS", ps: 258, nm: 400, tps: 310, tnm: 480, options: ["vmax", "opf", "popcorn"] },
    ],
    "X5 G05": [{ name: "xDrive30d 286 PS", ps: 286, nm: 650, tps: 340, tnm: 740, options: ["vmax", "dpf"] }],
  },
  VW: {
    "Golf 8": [
      { name: "2.0 TDI 150 PS", ps: 150, nm: 360, tps: 190, tnm: 420, options: ["vmax", "dpf", "startstop"] },
      { name: "GTI 245 PS", ps: 245, nm: 370, tps: 300, tnm: 450, options: ["vmax", "opf", "dsg"] },
    ],
    "T6.1 Transporter": [{ name: "2.0 TDI 150 PS", ps: 150, nm: 340, tps: 190, tnm: 410, options: ["vmax", "dpf", "egr"] }],
  },
  Audi: {
    "A4 B9": [{ name: "40 TDI 204 PS", ps: 204, nm: 400, tps: 245, tnm: 480, options: ["vmax", "dpf", "dsg"] }],
    "RS3 8Y": [{ name: "2.5 TFSI 400 PS", ps: 400, nm: 500, tps: 470, tnm: 600, options: ["vmax", "opf", "popcorn"] }],
  },
  "Mercedes-Benz": {
    "C-Klasse W206": [{ name: "C 220 d 200 PS", ps: 200, nm: 440, tps: 240, tnm: 510, options: ["vmax", "dpf"] }],
    "Sprinter 907": [{ name: "316 CDI 163 PS", ps: 163, nm: 360, tps: 200, tnm: 430, options: ["vmax", "dpf", "egr"] }],
  },
};
