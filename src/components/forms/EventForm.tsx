import React, { useMemo, useState } from "react";
import { iso } from "@/lib/date";
import { newId } from "@/lib/id";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import type { Item } from "@/types/item";

type FrequencyUnit =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "YEARLY"
  | "QUARTERLY"
  | "UNIQUE";

type Mode = "event" | "med";

const ENDPOINT_URL = "http://localhost:8080/responsibles/tasks";
// troque para false se quiser mockar
const USE_ENDPOINT = true;

export default function EventForm({
  initial,
  onSave,
  mode = "event",
}: {
  initial?: Partial<Item>;
  onSave: (it: Item) => void;
  mode?: Mode;
}) {
  // textos conforme o modo
  const UI = useMemo(() => {
    if (mode === "med") {
      return {
        titleLabel: "Nome do remédio/procedimento",
        titlePh: "Dipirona, Curativo...",
        descLabel: "Observações",
        submitText: "Salvar remédio/proced.",
      };
    }
    return {
      titleLabel: "Título do evento",
      titlePh: "Consulta, reunião, passeio...",
      descLabel: "Descrição",
      submitText: "Salvar evento",
    };
  }, [mode]);

  const [data, setData] = useState<Item>({
    id: initial?.id || newId(),
    type: initial?.type || (mode === "med" ? "med" : "event"),
    title: initial?.title || "",
    date: initial?.date || iso(new Date()),
    time: initial?.time || "",
    description: initial?.description || "",
    dose: (initial as any)?.dose || "", // ignorado para payload do task; mantido para compat
  });

  const [isRepeated, setIsRepeated] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<number>(1);
  const [frequencyUnit, setFrequencyUnit] = useState<FrequencyUnit>("UNIQUE");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | undefined>();

  const repetitionLocked = useMemo(() => frequencyUnit === "UNIQUE", [frequencyUnit]);

  function getAuthBasic() {
    return localStorage.getItem("auth_basic");
  }

  function toStartDateTimestamp(date: string, time?: string) {
    const dt = `${date}T${(time && time.trim()) ? time : "00:00"}:00`;
    return new Date(dt).getTime();
  }

  async function postTask() {
    const basic = getAuthBasic();
    if (!basic) throw new Error("Sessão inválida: faça login para salvar.");

    const payload = {
      description: data.title + ': ' + data.description,
      repeated: repetitionLocked ? false : isRepeated,
      startDate: toStartDateTimestamp(data.date, data.time),
      frequency: repetitionLocked ? 0 : Number(frequency) || 0,
      frequencyUnit,
    };

    const res = await fetch(ENDPOINT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${basic}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Falha ao salvar (HTTP ${res.status})`);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(undefined);

    if (!data.title.trim()) {
      setErr(mode === "med" ? "Informe o nome do remédio/procedimento" : "Informe o título do evento");
      return;
    }
    if (!data.date) {
      setErr("Informe a data");
      return;
    }

    setSubmitting(true);
    try {
      if (USE_ENDPOINT) {
        await postTask();
      } else {
        await new Promise((r) => setTimeout(r, 300)); // mock
      }

      onSave({ ...data, title: data.title.trim() });
    } catch (e: any) {
      setErr(e?.message || "Falha ao salvar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium">{UI.titleLabel}</label>
          <Input
            required
            placeholder={UI.titlePh}
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Data</label>
          <Input
            type="date"
            required
            value={data.date}
            onChange={(e) => setData({ ...data, date: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Hora</label>
          <Input
            type="time"
            value={data.time}
            onChange={(e) => setData({ ...data, time: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium">{UI.descLabel}</label>
          <Textarea
            rows={3}
            placeholder={mode === "med" ? "Tomar após o almoço..." : "Detalhes opcionais"}
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
          />
        </div>

        <div className="md:col-span-2 grid grid-cols-1 gap-3 md:grid-cols-3 items-end">
          <div className="flex items-center gap-2">
            <input
              id="isRepeated"
              type="checkbox"
              className="h-4 w-4"
              checked={repetitionLocked ? false : isRepeated}
              onChange={(e) => setIsRepeated(e.target.checked)}
              disabled={repetitionLocked}
            />
            <label htmlFor="isRepeated" className="text-sm">Repetir</label>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Frequência</label>
            <Input
              type="number"
              min={1}
              value={repetitionLocked ? 0 : frequency}
              onChange={(e) => setFrequency(parseInt(e.target.value || "0", 10))}
              disabled={repetitionLocked}
              placeholder="Ex.: 1"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Unidade</label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
              value={frequencyUnit}
              onChange={(e) => setFrequencyUnit(e.target.value as FrequencyUnit)}
            >
              <option value="UNIQUE">Única (sem repetição)</option>
              <option value="DAILY">Diária</option>
              <option value="WEEKLY">Semanal</option>
              <option value="MONTHLY">Mensal</option>
              <option value="QUARTERLY">Trimestral</option>
              <option value="YEARLY">Anual</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-[#0097b2] hover:bg-[#00aecf] text-white"
          disabled={submitting}
        >
          {submitting ? "Salvando..." : UI.submitText}
        </Button>
      </div>
    </form>
  );
}
