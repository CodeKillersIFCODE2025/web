import React, { useMemo } from "react";
import { addDays, eachDayOfInterval, isToday } from "date-fns";
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
  const start = new Date(referenceISO);        // dia atual como início
  const end   = addDays(start, 6);             // +6 dias = 7 dias no total
  const days  = eachDayOfInterval({ start, end });

  const groups = useMemo(() => {
    const map: Record<string, Item[]> = {};
    for (const it of items) {
      (map[it.date] ??= []).push(it);
    }
    Object.values(map).forEach(list =>
      list.sort(
        (a, b) =>
          (a.time || "").localeCompare(b.time || "") ||
          a.title.localeCompare(b.title)
      )
    );
    return map;
  }, [items]);

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden">
      <div className="flex snap-x snap-mandatory gap-3 px-1 pb-2">
        {days.map((d) => {
          const keyISO = fmt(d, "yyyy-MM-dd");
          return (
            <div
              key={d.toISOString()}
              className="snap-start shrink-0 w-[280px] sm:w-[320px] lg:w-[380px]"
            >
              <DayColumn
                dateLabel={fmt(d, "EEE, d 'de' MMM")}
                isToday={isToday(d)}
                items={groups[keyISO] ?? []}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
