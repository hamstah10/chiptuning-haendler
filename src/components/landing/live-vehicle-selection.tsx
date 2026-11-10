import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, RotateCcw } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getVehicleData } from "@/lib/vehicle.functions";
import type { VehicleDetails, VehicleItem } from "@/lib/vehicle-api";
import type { Content } from "@/lib/content";
import { VehicleIcon } from "./vehicle-icon";
import { groupVehicleEngines } from "@/lib/vehicle-engine-groups";

export interface VehicleSelection { labels: string[]; details: VehicleDetails | null }

function SelectionField({ kind, parentId, value, label, onChange, c }: { kind: "types" | "brands" | "series" | "models" | "engines"; parentId: number | undefined; value: VehicleItem | undefined; label: string; onChange: (item: VehicleItem) => void; c: Content }) {
  const [search, setSearch] = useState("");
  const enabled = kind === "types" || Boolean(parentId);
  const query = useQuery({
    queryKey: ["dct-vehicles", kind, parentId],
    queryFn: () => kind === "types" ? getVehicleData({ data: { kind } }) : getVehicleData({ data: { kind, id: parentId ?? 0 } }),
    enabled, staleTime: 300000,
  });
  const items = query.data?.items ?? [];
  const filteredItems = items.filter((item) => item.name.toLocaleLowerCase(c.locale).includes(search.toLocaleLowerCase(c.locale)));
  const renderItem = (item: VehicleItem) => <SelectItem key={item.id} value={String(item.id)}><span className="flex min-w-0 items-center gap-2"><VehicleIcon key={`${item.icon}-${item.image}`} item={item} /><span className="truncate">{item.name}</span></span></SelectItem>;
  return <div className="grid min-w-0 gap-2">
    <span className="label-caps text-xs text-strong">{label}</span>
    <Select value={value ? String(value.id) : ""} disabled={!enabled || query.isPending || query.data?.error} onValueChange={(id) => { const item = items.find((entry) => String(entry.id) === id); if (item) onChange(item); }}>
      <SelectTrigger aria-label={label} className="w-full min-w-0 [&>span]:truncate"><SelectValue placeholder={enabled && query.isPending ? c.vehicleApi.loading : c.vehicleCheck.choose} /></SelectTrigger>
      <SelectContent>
        <div className="p-2"><Input aria-label={`${label}: ${c.vehicleApi.search}`} placeholder={c.vehicleApi.search} value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.stopPropagation()} /></div>
        {kind === "engines" ? groupVehicleEngines(filteredItems, c.locale).map((group) => <SelectGroup key={group.key}><SelectLabel className="border-b border-border text-muted-foreground">{group.fuel ? c.vehicleApi.fuels[group.fuel] : group.label}</SelectLabel>{group.items.map(renderItem)}</SelectGroup>) : filteredItems.map(renderItem)}
      </SelectContent>
    </Select>
    {enabled && (query.isError || query.data?.error) && <div role="alert" className="text-xs text-destructive">{c.vehicleApi.error}<Button variant="ghost" size="sm" onClick={() => void query.refetch()}><RotateCcw />{c.vehicleApi.retry}</Button></div>}
    {enabled && !query.isPending && !query.data?.error && items.length === 0 && <span className="text-xs text-muted-foreground">{c.vehicleApi.empty}</span>}
  </div>;
}

export function LiveVehicleSelection({ c, children, typeButtons = false }: { c: Content; children: (selection: VehicleSelection) => React.ReactNode; typeButtons?: boolean }) {
  const [chosen, setChosen] = useState<Array<VehicleItem | undefined>>([]);
  const types = useQuery({ queryKey: ["dct-vehicles", "types", undefined], queryFn: () => getVehicleData({ data: { kind: "types" } }), enabled: typeButtons, staleTime: 300000 });
  const engine = chosen[4];
  const details = useQuery({ queryKey: ["dct-vehicles", "engine-details", engine?.id], queryFn: () => getVehicleData({ data: { kind: "engine-details", id: engine?.id ?? 0 } }), enabled: Boolean(engine), staleTime: 300000 });
  const labels = [c.vehicleApi.type, c.vehicleCheck.brand, c.vehicleApi.series, c.vehicleCheck.model, c.vehicleCheck.engine];
  const kinds = ["types", "brands", "series", "models", "engines"] as const;
  return <div className="grid gap-6">
    {typeButtons && <div className="grid gap-3">
      <span className="label-caps text-xs text-strong">{c.vehicleApi.type}</span>
      <div role="group" aria-label={c.vehicleApi.type} className="flex flex-wrap gap-2">
        {types.data?.items.map((item) => <Button key={item.id} variant={chosen[0]?.id === item.id ? "default" : "outline"} aria-pressed={chosen[0]?.id === item.id} onClick={() => setChosen([item])}><VehicleIcon item={item} />{item.name}</Button>)}
      </div>
      {types.isPending && <span role="status" className="text-sm text-muted-foreground">{c.vehicleApi.loading}</span>}
      {(types.isError || types.data?.error) && <div role="alert" className="text-sm text-destructive">{c.vehicleApi.error}<Button variant="ghost" onClick={() => void types.refetch()}><RotateCcw />{c.vehicleApi.retry}</Button></div>}
      {!types.isPending && !types.data?.error && types.data?.items.length === 0 && <span className="text-sm text-muted-foreground">{c.vehicleApi.empty}</span>}
    </div>}
    <div className={typeButtons ? "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"}>{kinds.map((kind, index) => typeButtons && index === 0 ? null : <SelectionField key={`${kind}-${chosen[index - 1]?.id ?? 0}`} kind={kind} parentId={chosen[index - 1]?.id} value={chosen[index]} label={labels[index] ?? kind} c={c} onChange={(item) => setChosen([...chosen.slice(0, index), item])} />)}</div>
    {engine && details.isPending && <div role="status" className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" />{c.vehicleApi.loading}</div>}
    {engine && (details.isError || details.data?.error) && <div role="alert" className="text-sm text-destructive">{c.vehicleApi.error}<Button variant="ghost" onClick={() => void details.refetch()}><RotateCcw />{c.vehicleApi.retry}</Button></div>}
    {children({ labels: chosen.map((item) => item?.name ?? ""), details: engine ? details.data?.details ?? null : null })}
  </div>;
}