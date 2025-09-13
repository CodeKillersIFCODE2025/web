import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FormError from "@/components/ui/FormError";
import { Route } from "@/app/routes";
import logo from "@/assets/logo.png";

type Props = {
  go: (route: Route) => void;
  busy?: boolean;
};

// 🔧 flag: troque para true quando o backend estiver pronto
const USE_ENDPOINT = true;

export default function LoginPage({ go, busy }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  function toBasic(e: string, p: string) {
    return btoa(`${e}:${p}`);
  }

  // dispara manualmente um "storage" para o useAuth reagir na mesma aba
  function notifyStorage(key: string, newValue: string | null) {
    try {
      const evt = new StorageEvent("storage", { key, newValue });
      window.dispatchEvent(evt);
    } catch {
      // fallback em navegadores que não permitem instanciar StorageEvent
      window.dispatchEvent(new Event("auth_storage_update"));
    }
  }

  function setAuthSession(basic: string, emailValue: string) {
    localStorage.setItem("auth_basic", basic);
    notifyStorage("auth_basic", basic);

    const user = {
      id: "local",
      name: emailValue.split("@")[0] || emailValue,
      username: emailValue,
      email: emailValue,
    };
    const userStr = JSON.stringify(user);
    localStorage.setItem("auth_user", userStr);
    notifyStorage("auth_user", userStr);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(undefined);

    if (!email.trim() || !password.trim()) {
      setErr("Preencha e-mail e senha");
      return;
    }

    setSubmitting(true);
    try {
      const basic = toBasic(email.trim(), password);

      if (USE_ENDPOINT) {
        const res = await fetch("http://localhost:8080/users", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Basic ${basic}`,
          },
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Falha ao entrar (HTTP ${res.status})`);
        }
        // const data = await res.json();
      }

      // grava sessão local + notifica e navega
      setAuthSession(basic, email.trim());
      go(Route.AgendaWeek);
    } catch (e: any) {
      setErr(e?.message || "Falha ao entrar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        {/* topo com logo e nome */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={logo}
            alt="ZELO"
            className="h-32 w-32 mb-4 rounded-full object-cover shadow-lg"
          />
          <div className="text-3xl font-bold text-gray-800">ZELO</div>
        </div>

        <h1 className="mb-1 text-2xl font-bold text-center">Entrar</h1>
        <p className="mb-4 text-sm text-gray-600 text-center">
          Informe seu e-mail e senha para acessar.
        </p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-xs font-medium">E-mail</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Senha</label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••"
            />
          </div>

          <FormError message={err} />

          <Button
            className="w-full bg-[#0097b2] hover:bg-[#00aecf] text-white flex items-center justify-center"
            type="submit"
            disabled={busy || submitting}
          >
            {busy || submitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Não tem conta?{" "}
          <button
            className="text-blue-600 underline"
            onClick={() => go(Route.Register)}
          >
            Cadastre-se
          </button>
        </div>
      </Card>
    </div>
  );
}
