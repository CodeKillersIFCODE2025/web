import React from "react";
import Button from "@/components/ui/Button";
import { Calendar as CalendarIcon, Pill, Plus, Menu } from "lucide-react";
import { Route } from "@/app/routes";

type Props = {
  collapsed: boolean;
  current: Route;
  onChange: (r: Route) => void;
  onToggle: () => void;
};

export default function Sidebar({ collapsed, current, onChange, onToggle }: Props) {
  const ItemRow = ({ id, label, icon }:{ id: Route; label: string; icon: React.ReactNode }) => (
    <button
      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-100 ${current === id ? "bg-gray-200" : ""}`}
      onClick={() => onChange(id)}
    >
      <span className="opacity-80">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );

  return (
    <aside className={`h-full shrink-0 border-r border-gray-200 bg-white ${collapsed ? "w-16" : "w-64"} transition-[width] duration-200`}>
      <div className="flex items-center justify-between px-3 py-3">
        {!collapsed && <div className="font-semibold">Minha Agenda</div>}
        <Button variant="ghost" className="p-2" onClick={onToggle} aria-label="Toggle menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="px-2 space-y-1">
        <ItemRow id={Route.AgendaWeek} label="Agenda (semanal)" icon={<CalendarIcon className="h-4 w-4" />} />
        <ItemRow id={Route.NewEvent}   label="Criar evento"       icon={<Plus className="h-4 w-4" />} />
        <ItemRow id={Route.NewMed}     label="Criar remédio/proc." icon={<Pill className="h-4 w-4" />} />
      </div>
    </aside>
  );
}
