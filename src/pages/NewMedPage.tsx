import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { iso } from "@/lib/date";
import { newId } from "@/lib/id";
import type { Item } from "@/types/item";

export default function NewMedPage({ onSave }:{ onSave:(it: Item)=>void }) {
  const [data, setData] = useState<Item>({
    id: newId(),
    type: "med",
    title: "",
    date: iso(new Date()),
    time: "",
    description: "",
    dose: "",
  });

  return (
    <Card>
      <form className="space-y-3" onSubmit={(e)=>{ e.preventDefault(); onSave({ ...data, title: data.title.trim() }); }}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium">Nome do remédio/procedimento</label>
            <Input required value={data.title} onChange={(e)=>setData({ ...data, title: e.target.value })} placeholder="Dipirona, Curativo..." />
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
            <Input value={data.dose} onChange={(e)=>setData({ ...data, dose: e.target.value })} placeholder="500mg, 1 cp, 20ml..." />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium">Observações</label>
            <Textarea rows={3} value={data.description} onChange={(e)=>setData({ ...data, description: e.target.value })} placeholder="Tomar após o almoço..." />
          </div>
        </div>
        <div className="flex justify-end"><Button type="submit">Salvar remédio/proced.</Button></div>
      </form>
    </Card>
  );
}
