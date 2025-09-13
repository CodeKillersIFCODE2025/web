import React, { useState } from "react";
import { iso } from "@/lib/date";
import { newId } from "@/lib/id";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import type { Item } from "@/types/item";

export default function MedForm({ initial, onSave }:{ initial?: Partial<Item>; onSave:(it: Item)=>void }) {
  const [data, setData] = useState<Item>({
    id: initial?.id || newId(),
    type: "med",
    title: initial?.title || "",
    date: initial?.date || iso(new Date()),
    time: initial?.time || "",
    description: initial?.description || "",
    dose: initial?.dose || "",
  });

  return (
    <form className="space-y-3" onSubmit={(e)=>{ e.preventDefault(); onSave({ ...data, title: data.title.trim() }); }}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium">Nome do remédio/procedimento</label>
          <Input required placeholder="Dipirona, Curativo, Fisioterapia..." value={data.title} onChange={(e)=>setData({ ...data, title: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Data</label>
          <Input type="date" required value={data.date} onChange={(e)=>setData({ ...data, date: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Hora</label>
          <Input type="time" value={data.time} onChange={(e)=>setData({ ...data, time: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Dose / Detalhe</label>
          <Input placeholder="500mg, 1 cp, 20ml, Sessão 30min..." value={data.dose} onChange={(e)=>setData({ ...data, dose: e.target.value })}/>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium">Observações</label>
          <Textarea rows={3} placeholder="Tomar após o almoço, evitar jejum..." value={data.description} onChange={(e)=>setData({ ...data, description: e.target.value })}/>
        </div>
      </div>
      <div className="flex justify-end"><Button type="submit">Salvar remédio/proced.</Button></div>
    </form>
  );
}
