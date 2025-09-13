import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FormError from "@/components/ui/FormError";
import { Route } from "@/app/routes";

type Props = {
  onSubmit: (username: string, password: string) => Promise<void>;
  go: (route: Route) => void;
  busy?: boolean;
};

export default function LoginPage({ onSubmit, go, busy }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | undefined>();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(undefined);
    try {
      await onSubmit(username, password);
    } catch (e: any) {
      setErr(e?.message || "Falha ao entrar");
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <h1 className="mb-1 text-2xl font-bold">Entrar</h1>
        <p className="mb-4 text-sm text-gray-600">Use seu usuário e senha (Basic).</p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-xs font-medium">Usuário</label>
            <Input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="seu.usuario" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Senha</label>
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="•••••••" />
          </div>

          <FormError message={err} />

          <Button className="w-full" type="submit" disabled={busy}>
            {busy ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Não tem conta?{" "}
          <button className="text-blue-600 underline" onClick={() => go(Route.Register)}>
            Cadastre-se
          </button>
        </div>
      </Card>
    </div>
  );
}
