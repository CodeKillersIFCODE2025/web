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

// 🔧 troque para true quando o backend estiver pronto
const USE_ENDPOINT = true;
const ENDPOINT_URL = "http://localhost:8080/responsibles";

export default function RegisterPage({ go, busy }: Props) {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone]     = useState("");
  const [address, setAddress] = useState("");
  const [err, setErr]         = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(undefined);

    if (password !== confirm) {
      setErr("As senhas não conferem");
      return;
    }
    if (!name.trim() || !email.trim() || !password.trim() || !phone.trim() || !address.trim()) {
      setErr("Preencha todos os campos obrigatórios");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,                 // em produção, evite enviar em claro
        phone: phone.trim(),
        address: address.trim(),
      };

      if (USE_ENDPOINT) {
        const res = await fetch(ENDPOINT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
        // console.log("MOCK cadastro:", payload);
      }

      // sucesso → volta para Login
      go(Route.Login);
    } catch (e: any) {
      setErr(e?.message || "Falha no cadastro");
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

        <h1 className="mb-1 text-2xl font-bold text-center">Criar conta</h1>
        <p className="mb-4 text-sm text-gray-600 text-center">
          Informe seus dados para concluir o cadastro.
        </p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-xs font-medium">Nome completo</label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

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

          <div>
            <label className="mb-1 block text-xs font-medium">Telefone</label>
            <Input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="5511999999999"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Endereço</label>
            <Input
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua, número, complemento"
            />
          </div>

          <FormError message={err} />

          <Button
            className="w-full bg-[#0097b2] hover:bg-[#00aecf] text-white flex items-center justify-center"
            type="submit"
            disabled={busy || submitting}
          >
            {busy || submitting ? "Cadastrando..." : "Criar conta"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Já tem conta?{" "}
          <button
            className="text-blue-600 underline"
            onClick={() => go(Route.Login)}
          >
            Entrar
          </button>
        </div>
      </Card>
    </div>
  );
}
