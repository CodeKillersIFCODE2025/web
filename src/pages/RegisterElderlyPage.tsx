import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FormError from "@/components/ui/FormError";
import { Route } from "@/app/routes";

// 🔧 troque para true quando o backend estiver pronto
const USE_ENDPOINT = false;
const ENDPOINT_URL = "http://localhost:8080/elderly";

type Props = {
  go: (route: Route) => void;
  busy?: boolean;
};

export default function RegisterElderlyPage({ go, busy }: Props) {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr]         = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  function getBasicFromStorage(): string | null {
    return localStorage.getItem("auth_basic");
  }

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
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password, // em produção, evite enviar em claro
      };

      if (USE_ENDPOINT) {
        const basic = getBasicFromStorage();
        if (!basic) {
          throw new Error("Você precisa estar logado para registrar um idoso.");
        }

        const res = await fetch(ENDPOINT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${basic}`,
            "Accept": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Falha ao cadastrar (HTTP ${res.status})`);
        }
        // opcional: const data = await res.json();
      } else {
        // MOCK: simula latência e sucesso
        await new Promise((r) => setTimeout(r, 400));
        // console.log("MOCK elderly:", payload);
      }

      // sucesso -> volta para a Agenda
      go(Route.AgendaWeek);
    } catch (e: any) {
      setErr(e?.message || "Falha no cadastro do idoso");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <Card className="w-full">
        <h1 className="mb-1 text-2xl font-bold">Cadastrar idoso</h1>
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
