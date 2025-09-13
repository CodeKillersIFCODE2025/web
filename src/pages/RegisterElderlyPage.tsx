import React, { useEffect, useRef, useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FormError from "@/components/ui/FormError";
import Badge from "@/components/ui/Badge";
import { Route } from "@/app/routes";

const USE_ENDPOINT = true;
const ENDPOINT_URL = "http://localhost:8080/elderly";

type Props = {
  go: (route: Route) => void;
  busy?: boolean;
};

type Elderly = {
  id: string;
  name: string;
  email: string;
  lastCheckIn?: string | null;
  todayCheckInDone?: boolean;
};

type Mode = "loading" | "form" | "view";

export default function RegisterElderlyPage({ go, busy }: Props) {
  const [mode, setMode] = useState<Mode>("loading");
  const [elderly, setElderly] = useState<Elderly | null>(null);

  // form
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [confirm, setConfirm] = useState("");

  const [err, setErr]               = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  // evita dupla execução no StrictMode
  const didRunRef   = useRef(false);
  const loadingRef  = useRef(false);

  function getBasic(): string | null {
    return localStorage.getItem("auth_basic");
  }

  /** GET /elderly decide se mostra FORM (não cadastrado) ou VIEW (cadastrado) */
  async function fetchDecision() {
    if (!USE_ENDPOINT) {
      setMode("form");
      return;
    }
    if (loadingRef.current) return;
    loadingRef.current = true;
    setErr(undefined);
    setMode("loading");

    try {
      const basic = getBasic();
      if (!basic) throw new Error("Sessão inválida. Faça login para continuar.");

      // ⚠️ Apenas Authorization para evitar preflight CORS
      const res = await fetch(ENDPOINT_URL, {
        method: "GET",
        headers: { Authorization: `Basic ${basic}` },
        // nada de Cache-Control/Pragma custom (disparam OPTIONS)
      });

      if (res.status === 204) {
        setElderly(null);
        setMode("form");
        return;
      }
      if (!res.ok) {
        // 401/404/etc → trata como não cadastrado
        setElderly(null);
        setMode("form");
        return;
      }

      // 200 OK
      const txt = await res.text();
      if (!txt || txt.trim().length === 0) {
        setElderly(null);
        setMode("form");
        return;
      }

      let data: Elderly | null = null;
      try {
        data = JSON.parse(txt);
      } catch {
        setElderly(null);
        setMode("form");
        return;
      }

      if (data && data.id) {
        setElderly(data);
        setMode("view");
      } else {
        setElderly(null);
        setMode("form");
      }
    } catch (e: any) {
      // Em erro de rede/CORS, não trava em loading
      setErr(e?.message || "Falha ao consultar o idoso");
      setElderly(null);
      setMode("form");
    } finally {
      loadingRef.current = false;
    }
  }

  // chama GET ao montar (protegido contra StrictMode)
  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;
    fetchDecision();
  }, []);

  /** POST /elderly (cadastrar) */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(undefined);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErr("Preencha todos os campos obrigatórios");
      return;
    }
    if (password !== confirm) {
      setErr("As senhas não conferem");
      return;
    }

    setSubmitting(true);
    try {
      if (USE_ENDPOINT) {
        const basic = getBasic();
        if (!basic) throw new Error("Sessão inválida. Faça login para continuar.");

        const payload = {
          name: name.trim(),
          email: email.trim(),
          password,
        };

        const res = await fetch(ENDPOINT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${basic}`,
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Falha ao cadastrar (HTTP ${res.status})`);
        }
      } else {
        await new Promise((r) => setTimeout(r, 400)); // mock
      }

      // sucesso → volta para a Agenda
      go(Route.AgendaWeek);
    } catch (e: any) {
      setErr(e?.message || "Falha no cadastro do idoso");
    } finally {
      setSubmitting(false);
    }
  }

  // -------------------- Render --------------------

  if (mode === "loading") {
    return (
      <Card className="max-w-2xl">
        <div className="text-sm text-gray-600">Verificando cadastro do idoso...</div>
        <div className="mt-3">
          <Button variant="outline" onClick={fetchDecision}>Tentar novamente</Button>
        </div>
      </Card>
    );
  }

  if (mode === "view" && elderly) {
    return (
      <Card className="max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="mb-2 text-2xl font-bold">Idoso cadastrado</h1>
          <Button variant="outline" onClick={fetchDecision}>Recarregar</Button>
        </div>

        <div className="space-y-2 text-sm">
          <div><span className="font-medium">Nome: </span>{elderly.name}</div>
          <div><span className="font-medium">E-mail: </span>{elderly.email}</div>
          <div>
            <span className="font-medium">Último Check-in: </span>
            {elderly.lastCheckIn ? elderly.lastCheckIn : "—"}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Check-in de hoje: </span>
            {elderly.todayCheckInDone
              ? <Badge className="bg-green-100 text-green-700">Concluído</Badge>
              : <Badge className="bg-yellow-100 text-yellow-700">Pendente</Badge>}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => go(Route.AgendaWeek)}>Voltar</Button>
        </div>
      </Card>
    );
  }

  // MODO FORM (não cadastrado)
  return (
    <div className="max-w-2xl">
      <Card className="w-full">
        <div className="flex items-center justify-between">
          <h1 className="mb-1 text-2xl font-bold">Cadastrar idoso</h1>
          <Button variant="outline" onClick={fetchDecision}>Verificar novamente</Button>
        </div>
        <p className="mb-4 text-sm text-gray-600">
          Informe os dados do idoso para concluir o cadastro.
        </p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-xs font-medium">Nome completo</label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do idoso"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">E-mail</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Senha</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPass(e.target.value)}
                placeholder="•••••••"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Confirmar senha</label>
              <Input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="•••••••"
              />
            </div>
          </div>

          <FormError message={err} />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => go(Route.AgendaWeek)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-[#0097b2] hover:bg-[#00aecf] text-white"
              type="submit"
              disabled={busy || submitting}
            >
              {busy || submitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
