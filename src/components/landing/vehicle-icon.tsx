import { useState } from "react";
import type { VehicleItem } from "@/lib/vehicle-api";

export function VehicleIcon({ item }: { item: VehicleItem }) {
  const [failed, setFailed] = useState<string[]>([]);
  const src = [item.icon, item.image].find((url) => url && !failed.includes(url));
  if (!src) return null;
  return <img src={src} alt="" aria-hidden="true" className="size-6 shrink-0 object-contain" width={24} height={24} loading="lazy" onError={() => setFailed((previous) => [...previous, src])} />;
}