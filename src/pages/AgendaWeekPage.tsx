import React, { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import WeekView from "@/components/agenda/WeekView";
import { Route } from "@/app/routes";
import { Calendar as CalendarIcon, Pill, Plus } from "lucide-react";
import { addDays } from "date-fns";
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

const ENDPOINT_URL = "http://localhost:8080/responsibles/tasks";

/** parse "yyyy-MM-dd" como DATA LOCAL (evita UTC) */
function localDateFromISO(dateOnlyISO: string): Date {
  const [y, m, d] = dateOnlyISO.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
/** monta Date LOCAL com hora "HH:mm" */
function localDateTime(dateISO: string, time?: string): Date {
  const [y, m, d] = dateISO.split("-").map(Number);
  const [hh, mm] = (time || "00:00").split(":").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
}

export default function AgendaWeekPage({
  refISO,
  setRefISO,
  items,
  onEdit,
  onDelete,
  go,
}: Props) {
  const [remoteItems, setRemoteItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | undefined>();

  // 1º dia exibido = refISO (o App já garante que é HOJE em ISO local)
  const start = localDateFromISO(refISO);
  const end = addDays(start, 6);

  useEffect(() => {
    let disposed = false;
    async function fetchWeek() {
      setErr(undefined);
      setLoading(true);
      try {
        const basic = localStorage.getItem("auth_basic");
        if (!basic) throw new Error("Sessão inválida. Faça login para carregar a agenda.");

        const res = await fetch(ENDPOINT_URL, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Basic ${basic}`,
          },
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Falha ao carregar (HTTP ${res.status})`);
        }

        const data = (await res.json()) as Record<
          string,
          Array<{ id: string; description: string; date: string }>
        >;

        const parsed = adaptResponseToItems(data, start.getFullYear());

        // ✅ filtro por RANGE usando DATA LOCAL (sem UTC!)
        const filtered = parsed
          .filter((it) => {
            const d = localDateFromISO(it.date);
            return d >= start && d <= end;
          })
          // ✅ ordenação por datetime LOCAL
          .sort((a, b) => {
            const at = localDateTime(a.date, a.time).getTime();
            const bt = localDateTime(b.date, b.time).getTime();
            return at - bt || a.title.localeCompare(b.title);
          });

        if (!disposed) setRemoteItems(filtered);
      } catch (e: any) {
        if (!disposed) setErr(e?.message || "Falha ao carregar a agenda");
      } finally {
        if (!disposed) setLoading(false);
      }
    }
    fetchWeek();
    return () => {
      disposed = true;
    };
  }, [refISO]);

  const totalSemana = useMemo(() => remoteItems.length, [remoteItems]);

  return (
    <>
      {/* Navegação de semanas removida */}
      <div className="flex items-center gap-2 mb-2">
        <Button onClick={() => go(Route.NewEvent)}>
          <Plus className="h-4 w-4" /> Novo evento
        </Button>
        <Button variant="outline" onClick={() => go(Route.NewMed)}>
          <Pill className="h-4 w-4" /> Novo remédio/proc.
        </Button>
      </div>

      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <div className="text-sm font-medium">
            {fmt(start, "d MMM")} – {fmt(end, "d MMM yyyy")}
          </div>
        </div>
      </Card>

      {err && <Card className="border-red-200 bg-red-50 text-red-700">{err}</Card>}

      <WeekView
        referenceISO={refISO}
        items={remoteItems}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
}

/* -------------------------- helpers de parsing -------------------------- */

const PT_MONTHS: Record<string, number> = {
  janeiro: 1,
  fevereiro: 2,
  marco: 3,
  março: 3,
  abril: 4,
  maio: 5,
  junho: 6,
  julho: 7,
  agosto: 8,
  setembro: 9,
  outubro: 10,
  novembro: 11,
  dezembro: 12,
};

// "13 de setembro - 14:00" -> { dateISO: "yyyy-MM-dd", time: "HH:mm" }
function parsePtDateStr(
  input: string,
  yearFallback: number
): { dateISO: string; time: string } | null {
  const [datePart, timePart] = input.split(" - ").map((s) => s.trim());
  if (!datePart) return null;

  const parts = datePart.split(" ").map((s) => s.trim()).filter(Boolean); // ["13","de","setembro"]
  const day = parseInt(parts[0] || "", 10);
  const month = PT_MONTHS[(parts[2] || "").toLowerCase()];
  if (!day || !month) return null;

  const yyyy = yearFallback;
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const time = timePart && /^\d{2}:\d{2}$/.test(timePart) ? timePart : "00:00";
  return { dateISO: `${yyyy}-${mm}-${dd}`, time };
}

function adaptResponseToItems(
  data: Record<string, Array<{ id: string; description: string; date: string }>>,
  yearFallback: number
): Item[] {
  const out: Item[] = [];
  for (const [, arr] of Object.entries(data)) {
    for (const row of arr) {
      const parsed = parsePtDateStr(row.date, yearFallback);
      if (!parsed) continue;
      out.push({
        id: row.id,
        type: "event", // se quiser diferenciar por "Remédio:" no description, dá pra usar "med"
        title: row.description?.trim() || "(sem título)",
        date: parsed.dateISO, // "yyyy-MM-dd" LOCAL
        time: parsed.time,    // "HH:mm"
        description: row.description || "",
      });
    }
  }
  return out;
}
