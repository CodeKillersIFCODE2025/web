import React from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Clock, Edit3, Trash2 } from "lucide-react";
import type { Item } from "@/types/item";

type Props = {
  dateLabel: string;
  isToday: boolean;
  items: Item[];
  onEdit: (it: Item) => void;
  onDelete: (id: string) => void;
};

export default function DayColumn({ dateLabel, isToday, items, onEdit, onDelete }: Props) {
  return (
    <Card className="min-h-[220px]">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold">{dateLabel}</div>
        {isToday && <Badge>Hoje</Badge>}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">Sem itens.</p>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="flex items-start justify-between rounded-lg border border-gray-200 p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Badge>{it.type === "event" ? "Evento" : "Remédio/Proced."}</Badge>
                  {it.time && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{it.time}</span>}
                </div>
                <div className="truncate text-sm font-medium">{it.title}</div>
                {it.dose && <div className="truncate text-xs text-gray-500">Dose: {it.dose}</div>}
                {it.description && <div className="truncate text-xs text-gray-500">{it.description}</div>}
              </div>
              <div className="flex shrink-0 items-center gap-1 pl-2">
                <Button variant="ghost" className="p-2" onClick={() => onEdit(it)} title="Editar"><Edit3 className="h-5 w-5" /></Button>
                <Button variant="ghost" className="p-2" onClick={() => onDelete(it.id)} title="Excluir"><Trash2 className="h-5 w-5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
