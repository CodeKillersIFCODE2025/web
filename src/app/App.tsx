import React, { useMemo, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Route } from "@/app/routes";
import { fmt, iso } from "@/lib/date";
import { compareAsc, parseISO } from "date-fns";
import { useItems } from "@/hooks/useItems";
import AgendaWeekPage from "@/pages/AgendaWeekPage";
import NewEventPage from "@/pages/NewEventPage";
import NewMedPage from "@/pages/NewMedPage";
import type { Item } from "@/types/item";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function App() {
  const { items, upsert, removeById } = useItems();
  const [route, setRoute] = useState<Route>(Route.AgendaWeek);
  const [collapsed, setCollapsed] = useState(false);
  const [refISO, setRefISO] = useState<string>(iso(new Date()));
  const [editing, setEditing] = useState<Item | null>(null);

  const sorted = useMemo(
    () => items.slice().sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date))),
    [items]
  );

  return (
    <div className="flex h-screen w-screen bg-gray-50 text-gray-900">
      <Sidebar collapsed={collapsed} current={route} onChange={setRoute} onToggle={()=>setCollapsed(!collapsed)} />

      <main className="flex-1 flex flex-col gap-4 p-4 md:p-6 overflow-auto">
        <div className="text-xs uppercase tracking-wide text-gray-500">{fmt(new Date(refISO), "EEEE, d 'de' MMMM")}</div>
        <h1 className="text-2xl font-bold">
          {route === Route.AgendaWeek && "Agenda (semanal)"}
          {route === Route.NewEvent && "Criar evento"}
          {route === Route.NewMed && "Criar remédio/procedimento"}
          {route === Route.Edit && "Editar item"}
        </h1>

        {route === Route.AgendaWeek && (
          <AgendaWeekPage
            refISO={refISO}
            setRefISO={setRefISO}
            items={sorted}
            onEdit={(it)=>{ setEditing(it); setRoute(Route.Edit); }}
            onDelete={removeById}
            go={setRoute}
          />
        )}

        {route === Route.NewEvent && <NewEventPage onSave={(it)=>{ upsert(it); setRoute(Route.AgendaWeek); }} />}
        {route === Route.NewMed   && <NewMedPage   onSave={(it)=>{ upsert(it); setRoute(Route.AgendaWeek); }} />}

        {route === Route.Edit && editing && (
          <Card>
            {/* Reaproveita os formulários de criação como edição */}
            {editing.type === "event"
              ? <NewEventPage onSave={(it)=>{ upsert(it); setEditing(null); setRoute(Route.AgendaWeek); }} />
              : <NewMedPage   onSave={(it)=>{ upsert(it); setEditing(null); setRoute(Route.AgendaWeek); }} />}
            <div className="mt-3 flex justify-end">
              <Button variant="outline" onClick={()=>{ setEditing(null); setRoute(Route.AgendaWeek); }}>Cancelar</Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
