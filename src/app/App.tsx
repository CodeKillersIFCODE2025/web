import React, { useMemo, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Route } from "@/app/routes";
import { fmt } from "@/lib/date";
import { compareAsc, parseISO } from "date-fns";
import { useItems } from "@/hooks/useItems";
import AgendaWeekPage from "@/pages/AgendaWeekPage";
import NewEventPage from "@/pages/NewEventPage";
import NewMedPage from "@/pages/NewMedPage";
import RegisterElderlyPage from "@/pages/RegisterElderlyPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import type { Item } from "@/types/item";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

// 🔧 util local: "yyyy-MM-dd" no FUSO LOCAL
function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
// parse "yyyy-MM-dd" como data LOCAL (evita UTC)
function localDateFromISO(dateOnlyISO: string): Date {
  const [y, m, d] = dateOnlyISO.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export default function App() {
  const { items, upsert, removeById } = useItems();
  const { signedIn, user, login, register, logout } = useAuth();

  const [route, setRoute] = useState<Route>(signedIn ? Route.AgendaWeek : Route.Login);
  const [collapsed, setCollapsed] = useState(false);

  // ✅ INICIALIZA refISO com hoje LOCAL (não UTC)
  const [refISO, setRefISO] = useState<string>(todayISO());

  const [editing, setEditing] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);

  React.useEffect(() => {
    if (!signedIn && route !== Route.Login && route !== Route.Register) {
      setRoute(Route.Login);
    }
    if (signedIn && (route === Route.Login || route === Route.Register)) {
      setRoute(Route.AgendaWeek);
    }
  }, [signedIn]); // eslint-disable-line

  // ✅ Sempre que abrir a Agenda, garanta HOJE (local)
  React.useEffect(() => {
    if (route === Route.AgendaWeek) {
      const t = todayISO();
      if (refISO !== t) setRefISO(t);
    }
  }, [route]); // eslint-disable-line

  const sorted = useMemo(
    () => items.slice().sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date))),
    [items]
  );

  async function handleLogin(username: string, password: string) {
    setBusy(true);
    try {
      await login(username, password);
      setRoute(Route.AgendaWeek);
    } finally {
      setBusy(false);
    }
  }
  async function handleRegister(name: string, username: string, password: string, email?: string) {
    setBusy(true);
    try {
      await register(name, username, password, email);
      setRoute(Route.AgendaWeek);
    } finally {
      setBusy(false);
    }
  }

  if (!signedIn) {
    if (route === Route.Register) return <RegisterPage onSubmit={handleRegister} go={setRoute} busy={busy} />;
    return <LoginPage onSubmit={handleLogin} go={setRoute} busy={busy} />;
  }

  return (
    <div className="flex h-screen w-screen bg-gray-50 text-gray-900">
      <Sidebar
        collapsed={collapsed}
        current={route}
        onChange={setRoute}
        onToggle={() => setCollapsed(!collapsed)}
        userName={user?.name}
        onLogout={() => { logout(); setRoute(Route.Login); }}
      />

      <main className="flex-1 flex flex-col gap-4 p-4 md:p-6 overflow-auto">
        <div className="text-xs uppercase tracking-wide text-gray-500">
          {/* ✅ renderiza data do cabeçalho no FUSO LOCAL */}
          {fmt(localDateFromISO(refISO), "EEEE, d 'de' MMMM")}
        </div>
        <h1 className="text-2xl font-bold">
          {route === Route.AgendaWeek && "Agenda (semanal)"}
          {route === Route.NewEvent && "Criar evento"}
          {route === Route.NewMed && "Criar remédio/procedimento"}
          {route === Route.Edit && "Editar item"}
          {route === Route.RegisterElderly && "Cadastrar idoso"}
        </h1>

        {route === Route.AgendaWeek && (
          <AgendaWeekPage
            refISO={refISO}
            setRefISO={setRefISO}
            items={sorted}
            onEdit={(it) => { setEditing(it); setRoute(Route.Edit); }}
            onDelete={removeById}
            go={setRoute}
          />
        )}

        {route === Route.NewEvent && <NewEventPage onSave={(it)=>{ upsert(it); setRoute(Route.AgendaWeek); }} />}
        {route === Route.NewMed   && <NewMedPage   onSave={(it)=>{ upsert(it); setRoute(Route.AgendaWeek); }} />}
        {route === Route.RegisterElderly && <RegisterElderlyPage go={setRoute} />}

        {route === Route.Edit && editing && (
          <Card>
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
