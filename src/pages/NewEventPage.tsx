import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { iso } from "@/lib/date";
import { newId } from "@/lib/id";
import type { Item } from "@/types/item";

export default function NewEventPage({ onSave }:{ onSave:(it: Item)=>void }) {
  const [data, setData] = useState<Item>({
    id: newId(),
    type: "event",
    title: "",
    date: iso(new Date()),
    time: "",
    description: "",
  });

  return (
    <Card>
      <form className="space-y-3" onSubmit={(e)=>{ e.preventDefault(); onSave({ ...data, title: data.title.trim() }); }}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium">Título do evento</label>
            <Input required value={data.title} onChange={(e)=>setData({ ...data, title: e.target.value })} placeholder="Consulta, reunião..." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Data</label>
            <Input type="date" required value={data.date} onChange={(e)=>setData({ ...data, date: e.target.value })}/>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Hora</label>
            <Input type="time" value={data.time} onChange={(e)=>setData({ ...data, time: e.target.value })}/>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium">Descrição</label>
            <Textarea rows={3} value={data.description} onChange={(e)=>setData({ ...data, description: e.target.value })} placeholder="Detalhes opcionais" />
          </div>
        </div>
        <div className="flex justify-end"><Button type="submit">Salvar evento</Button></div>
      </form>
    </Card>
  );
}
