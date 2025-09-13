import React, { useMemo } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { CalendarClock, Edit3, Trash2 } from "lucide-react";
import { addDays } from "date-fns";
import { fmt } from "@/lib/date";
import type { Item } from "@/types/item";

type Props = {
  referenceISO: string; // "yyyy-MM-dd" (HOJE)
  items: Item[];
  onEdit: (it: Item) => void;
  onDelete: (id: string) => void;
};

/** Converte "yyyy-MM-dd" para Date em FUSO LOCAL (evita shift UTC). */
function localDateFromISO(dateOnlyISO: string): Date {
  const [y, m, d] = dateOnlyISO.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Gera "yyyy-MM-dd" em FUSO LOCAL (NÃO usa toISOString). */
function toLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function WeekView({ referenceISO, items, onEdit, onDelete }: Props) {
  // 1) HOJE é exatamente referenceISO
  const start = useMemo(() => localDateFromISO(referenceISO), [referenceISO]);

  // 2) gera 7 dias a partir de HOJE
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = addDays(start, i);
        return {
          date: d,
          iso: toLocalISO(d), // ✅ chave local, sem UTC
          labelTop: fmt(d, "eeee, d 'de' LLL"),
        };
      }),
    [start]
  );

  // 3) agrupa itens por dia (usando a chave ISO "yyyy-MM-dd")
  const byDate: Record<string, Item[]> = useMemo(() => {
    const map: Record<string, Item[]> = {};
    for (const it of items) {
      const key = it.date; // já vem "yyyy-MM-dd"
      if (!map[key]) map[key] = [];
      map[key].push(it);
    }
    // ordena itens de cada dia
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => {
        const at = (a.time || "00:00");
        const bt = (b.time || "00:00");
        return at.localeCompare(bt) || a.title.localeCompare(b.title);
      });
    });
    return map;
  }, [items]);

  const todayISO = toLocalISO(new Date()); // ✅ para o chip "Hoje"

  return (
    <div className="flex gap-4 overflow-x-auto pb-1">
      {days.map(({ iso: dayISO, labelTop }) => {
        const dayItems = byDate[dayISO] || [];
        const isToday = dayISO === todayISO;

        return (
          <Card key={dayISO} className="min-w-[280px] max-w-[320px] flex-1">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-semibold capitalize">{labelTop}</div>
              {isToday && <Badge>Hoje</Badge>}
            </div>

            {dayItems.length === 0 ? (
              <div className="text-gray-500">Sem itens.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {dayItems.map((it) => (
                  <Card key={it.id} className="p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge>{it.type === "med" ? "Remédio" : "Tarefa"}</Badge>
                      {it.time && (
                        <div className="ml-auto flex items-center gap-1 text-sm text-gray-600">
                          <CalendarClock className="h-4 w-4" />
                          <span>{it.time}</span>
                        </div>
                      )}
                    </div>

                    <div className="font-semibold">{it.title}</div>
                    {it.description && (
                      <div className="text-sm text-gray-600 truncate">{it.description}</div>
                    )}

                    <div className="mt-2 flex items-center gap-2">
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
