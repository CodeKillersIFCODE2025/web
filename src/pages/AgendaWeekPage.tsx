import React from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import WeekView from "@/components/agenda/WeekView";
import { Route } from "@/app/routes";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Pill, Plus } from "lucide-react";
import { endOfWeek, startOfWeek, addWeeks } from "date-fns";
import { fmt } from "@/lib/date";
import type { Item } from "@/types/item";

type Props = {
  refISO: string;
  setRefISO: (iso: string) => void;
  items: Item[];
  onEdit: (it: Item) => void;
  onDelete: (id: string) => void;
  go: (r: Route) => void;
};

export default function AgendaWeekPage({ refISO, setRefISO, items, onEdit, onDelete, go }: Props) {
  const s = startOfWeek(new Date(refISO), { weekStartsOn: 0 });
  const e = endOfWeek(new Date(refISO),   { weekStartsOn: 0 });

  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <Button variant="outline" onClick={()=>setRefISO(fmt(addWeeks(new Date(refISO), -1), "yyyy-MM-dd"))}>
          <ChevronLeft className="h-4 w-4" /> Semana anterior
        </Button>
        <Button variant="ghost" onClick={()=>setRefISO(fmt(new Date(), "yyyy-MM-dd"))}>Hoje</Button>
        <Button variant="outline" onClick={()=>setRefISO(fmt(addWeeks(new Date(refISO), 1), "yyyy-MM-dd"))}>
          Próxima semana <ChevronRight className="h-4 w-4" />
        </Button>
        <Button onClick={()=>go(Route.NewEvent)}><Plus className="h-4 w-4" /> Novo evento</Button>
        <Button variant="outline" onClick={()=>go(Route.NewMed)}><Pill className="h-4 w-4" /> Novo remédio/proc.</Button>
      </div>

      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <div className="text-sm font-medium">
            {fmt(s, "d MMM")} – {fmt(e, "d MMM yyyy")}
          </div>
        </div>
        <Badge>Total semana: {items.filter(i => {
          const d = new Date(i.date);
          return d >= s && d <= e;
        }).length}</Badge>
      </Card>

      <WeekView referenceISO={refISO} items={items} onEdit={onEdit} onDelete={onDelete} />
    </>
  );
}
