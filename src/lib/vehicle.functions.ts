import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { VEHICLE_CONTEXT, vehicleDetailsSchema, vehicleItemSchema, vehiclePath, vehicleRequestSchema, type VehicleDetails, type VehicleItem } from "./vehicle-api";

export const getVehicleData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => vehicleRequestSchema.parse(input))
  .handler(async ({ data }): Promise<{ items: VehicleItem[]; details: VehicleDetails | null; error: boolean }> => {
    const token = process.env["TFD_VEHICLE_API_TOKEN"];
    const tokenId = process.env["TFD_VEHICLE_TOKEN_ID"];
    if (!token || !tokenId) return { items: [], details: null, error: true };
    try {
      const response = await fetch(`https://portal.dct-files.de/api/fahrzeugdatenbank${vehiclePath(data)}`, {
        headers: { Authorization: `Bearer ${token}`, "X-Token-Id": tokenId, "X-Vehicle-Data-Context": VEHICLE_CONTEXT, Accept: "application/json" },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        console.error("DCT vehicle request failed", response.status);
        return { items: [], details: null, error: true };
      }
      const payload: unknown = await response.json();
      if (data.kind === "engine-details") return { items: [], details: z.object({ data: vehicleDetailsSchema }).parse(payload).data, error: false };
      return { items: z.object({ data: z.array(vehicleItemSchema) }).parse(payload).data, details: null, error: false };
    } catch {
      console.error("DCT vehicle data unavailable");
      return { items: [], details: null, error: true };
    }
  });