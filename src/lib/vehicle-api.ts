import { z } from "zod";

export const vehicleRequestSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("types") }),
  z.object({ kind: z.enum(["brands", "series", "models", "engines", "engine-details"]), id: z.number().int().positive() }),
]);
export const VEHICLE_CONTEXT = "haendler_werden";
export interface VehicleItem { id: number; name: string }
export interface VehicleStage { id: number; name: string; description: string | null; price: number | null; hp: number | null; nm: number | null; ecu: string | null }
export interface VehicleDetails {
  engine: VehicleItem & { horsepower: number | null; torque: number | null; fuel: string | null };
  stages: VehicleStage[];
  ecus: Array<VehicleItem & { manufacturer: string | null }>;
}
export function vehiclePath(input: z.infer<typeof vehicleRequestSchema>) {
  const parsed = vehicleRequestSchema.parse(input);
  return parsed.kind === "types" ? "/types" : `/${parsed.kind}/${parsed.id}`;
}
export const vehicleItemSchema = z.object({ id: z.number().int().positive(), name: z.string() });
export const vehicleDetailsSchema = z.object({
  engine: vehicleItemSchema.extend({ horsepower: z.number().nullable(), torque: z.number().nullable(), fuel: z.string().nullable() }),
  stages: z.array(z.object({ id: z.number(), name: z.string(), description: z.string().nullable(), price: z.number().nullable(), hp: z.number().nullable(), nm: z.number().nullable(), ecu: z.string().nullable() })),
  ecus: z.array(vehicleItemSchema.extend({ manufacturer: z.string().nullable() })),
});