import { z } from "zod";

export const vehicleRequestSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("types") }),
  z.object({ kind: z.enum(["brands", "series", "models", "engines", "engine-details"]), id: z.number().int().positive() }),
]);
export const VEHICLE_CONTEXT = "haendler_werden";
export interface VehicleItem { id: number; name: string; icon?: string | null; image?: string | null }
export interface VehicleStage { id: number; name: string; description: string | null; price: number | null; hp: number | null; nm: number | null; ecu: string | null }
export interface VehicleOption extends VehicleItem { price: number | null; active: boolean; category: { name: string } | null }
export interface VehicleDetails {
  engine: VehicleItem & { horsepower: number | null; torque: number | null; fuel: string | null };
  stages: VehicleStage[];
  ecus: Array<VehicleItem & { manufacturer: string | null; options: VehicleOption[] }>;
  engineOptions: VehicleOption[];
}
export function vehiclePath(input: z.infer<typeof vehicleRequestSchema>) {
  const parsed = vehicleRequestSchema.parse(input);
  return parsed.kind === "types" ? "/types" : `/${parsed.kind}/${parsed.id}`;
}
export function vehicleMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  try {
    const url = new URL(path, "https://portal.dct-files.de");
    return url.protocol === "https:" && url.origin === "https://portal.dct-files.de" ? url.href : null;
  } catch { return null; }
}
const vehicleMediaSchema = z.string().nullable().optional().transform(vehicleMediaUrl);
export const vehicleItemSchema = z.object({ id: z.number().int().positive(), name: z.string(), icon: vehicleMediaSchema, image: vehicleMediaSchema });
const nullableNumber = z.union([z.number(), z.string().regex(/^\d+(\.\d+)?$/).transform(Number), z.null()]);
const vehicleOptionSchema = vehicleItemSchema.extend({
  price: nullableNumber.optional().transform((value) => value ?? null),
  active: z.boolean().default(true),
  category: z.object({ name: z.string() }).nullable().optional().transform((value) => value ?? null),
});
const vehicleOptionsSchema = z.array(vehicleOptionSchema).default([]).transform((options) => options.filter((option) => option.active));
export const vehicleDetailsSchema = z.object({
  engine: vehicleItemSchema.extend({ horsepower: nullableNumber, torque: nullableNumber, fuel: z.string().nullable() }),
  stages: z.array(z.object({ id: z.number(), name: z.string(), description: z.string().nullable(), price: nullableNumber, hp: nullableNumber, nm: nullableNumber, ecu: z.string().nullable() })),
  ecus: z.array(vehicleItemSchema.extend({ manufacturer: z.string().nullable(), options: vehicleOptionsSchema })),
  engineOptions: vehicleOptionsSchema,
});