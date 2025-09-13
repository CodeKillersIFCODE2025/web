import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FormError from "@/components/ui/FormError";
import { Route } from "@/app/routes";

type Props = {
  onSubmit: (name: string, username: string, password: string, email?: string) => Promise<void>;
  go: (route: Route) => void;
  busy?: boolean;
};

export default function RegisterPage({ onSubmit, go, busy }: Props) {
  const [name, setName]         = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPass]     = useState("");
  const [confirm, setConfirm]   = useState("");
  const [err, setErr]           = useState<string | undefined>();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(undefined);
    if (password !== confirm) {
      setErr("As senhas não conferem");
      return;
    }
    try {
      await onSubmit(name, username, password, email || undefined);
    } catch (e: any) {
      setErr(e?.message || "Falha no cadastro");
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <h1 className="mb-1 text-2xl font-bold">Criar conta</h1>
        <p className="mb-4 text-sm text-gray-600">Informe nome, usuário e senha. E-mail é opcional.</p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-xs font-medium">Nome</label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Usuário</label>
            <Input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="seu.usuario" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">E-mail (opcional)</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Senha</label>
              <Input type="password" required value={password} onChange={(e) => setPass(e.target.value)} placeholder="•••••••" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Confirmar senha</label>
              <Input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="•••••••" />
            </div>
          </div>

          <FormError message={err} />

          <Button className="w-full" type="submit" disabled={busy}>
            {busy ? "Cadastrando..." : "Criar conta"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Já tem conta?{" "}
          <button className="text-blue-600 underline" onClick={() => go(Route.Login)}>
            Entrar
          </button>
        </div>
      </Card>
    </div>
  );
}
