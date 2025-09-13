import React, { useMemo } from "react";
import { eachDayOfInterval, endOfWeek, isToday, startOfWeek } from "date-fns";
import { fmt } from "@/lib/date";
import DayColumn from "./DayColumn";
import type { Item } from "@/types/item";

type Props = {
  referenceISO: string;
  items: Item[];
  onEdit: (it: Item) => void;
  onDelete: (id: string) => void;
};

export default function WeekView({ referenceISO, items, onEdit, onDelete }: Props) {
  const start = startOfWeek(new Date(referenceISO), { weekStartsOn: 0 });
  const end   = endOfWeek(new Date(referenceISO),   { weekStartsOn: 0 });
  const days  = eachDayOfInterval({ start, end });

  const groups = useMemo(() => {
    const map: Record<string, Item[]> = {};
    for (const it of items) {
      (map[it.date] ??= []).push(it);
    }
    Object.values(map).forEach(list =>
      list.sort((a, b) => (a.time || "").localeCompare(b.time || "") || a.title.localeCompare(b.title))
    );
    return map;
  }, [items]);

  return (
    <div className="flex-1 overflow-auto">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {days.map((d) => (
          <DayColumn
            key={d.toISOString()}
            dateLabel={fmt(d, "EEE, d 'de' MMM")}
            isToday={isToday(d)}
            items={groups[fmt(d, "yyyy-MM-dd")] ?? []}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
