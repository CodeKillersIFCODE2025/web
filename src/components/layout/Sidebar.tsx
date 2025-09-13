import React from "react";
import Button from "@/components/ui/Button";
import { Calendar as CalendarIcon, Pill, Plus, Menu, UserPlus } from "lucide-react";
import { Route } from "@/app/routes";
// 👇 importe sua logo
import logo from "@/assets/logo.png";

type Props = {
  collapsed: boolean;
  current: Route;
  onChange: (r: Route) => void;
  onToggle: () => void;
  userName?: string;
  onLogout?: () => void;
};

export default function Sidebar({
  collapsed,
  current,
  onChange,
  onToggle,
  userName,
  onLogout,
}: Props) {
  const ItemRow = ({
    id,
    label,
    icon,
  }: {
    id: Route;
    label: string;
    icon: React.ReactNode;
  }) => (
    <button
      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white hover:bg-[#00a8c7] ${
        current === id ? "bg-[#00acc1]" : ""
      }`}
      onClick={() => onChange(id)}
    >
      <span className="opacity-80">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );

  return (
    <aside
      className={`h-full shrink-0 ${
        collapsed ? "w-16" : "w-64"
      } transition-[width] duration-200`}
      style={{ backgroundColor: "#0097b2" }}
    >
      <div className="flex items-center justify-between px-3 py-3">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src={logo} alt="ZELO" className="h-7 w-7" />
            <div className="font-bold text-white text-lg">ZELO</div>
          </div>
        )}
        <button
          className="p-2 rounded-lg hover:bg-[#00a8c7] text-white"
          onClick={onToggle}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* resto do sidebar */}
      <div className="px-2 space-y-1">
        <ItemRow
          id={Route.AgendaWeek}
          label="Agenda (semanal)"
          icon={<CalendarIcon className="h-4 w-4" />}
        />
        <ItemRow
          id={Route.NewEvent}
          label="Criar evento"
          icon={<Plus className="h-4 w-4" />}
        />
        <ItemRow
          id={Route.NewMed}
          label="Criar remédio/proc."
          icon={<Pill className="h-4 w-4" />}
        />
        <ItemRow
          id={Route.RegisterElderly}
          label="Idoso(a)"
          icon={<UserPlus className="h-4 w-4" />}
        />
      </div>

      {!collapsed && userName && (
        <div className="mt-auto p-3 text-xs text-white space-y-2">
          <div>
            Olá, <span className="font-medium">{userName}</span>
          </div>
          {onLogout && (
            <button
              className="w-full rounded-lg border border-white px-4 py-2 text-sm font-medium text-white hover:bg-[#00a8c7] transition"
              onClick={onLogout}
            >
              Sair
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
