// Autenticação Basic: salva "username:password" em Base64 no localStorage.
// Em produção, evite guardar senha em claro — aqui é MOCK para desenvolvimento.

const BASIC_KEY = "auth_basic";
const USER_KEY  = "auth_user";

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  email?: string;
};

// Helpers base64 (compatível browser)
function b64encode(s: string) {
  return typeof window !== "undefined"
    ? window.btoa(unescape(encodeURIComponent(s)))
    : Buffer.from(s, "utf-8").toString("base64");
}
function b64decode(s: string) {
  return typeof window !== "undefined"
    ? decodeURIComponent(escape(window.atob(s)))
    : Buffer.from(s, "base64").toString("utf-8");
}

export function buildBasic(username: string, password: string) {
  return b64encode(`${username}:${password}`);
}

export function getBasic(): string | null {
  return localStorage.getItem(BASIC_KEY);
}

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setSession(basic: string, user: AuthUser) {
  localStorage.setItem(BASIC_KEY, basic);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(BASIC_KEY);
  localStorage.removeItem(USER_KEY);
}

// ===== MOCK endpoints =====

// Login com username + password (gera Basic e "loga")
export async function apiLogin(username: string, password: string): Promise<{ basic: string; user: AuthUser }> {
  await new Promise((r) => setTimeout(r, 400));
  if (username.trim().length < 2 || password.length < 3) {
    throw new Error("Credenciais inválidas");
  }
  const basic = buildBasic(username.trim(), password);
  return {
    basic,
    user: {
      id: "u_" + Math.random().toString(36).slice(2, 8),
      name: username.trim(),
      username: username.trim(),
    },
  };
}

// Cadastro com name + username + password (email opcional)
export async function apiRegister(name: string, username: string, password: string, email?: string): Promise<{ basic: string; user: AuthUser }> {
  await new Promise((r) => setTimeout(r, 600));
  if (name.trim().length < 2 || username.trim().length < 2 || password.length < 3) {
    throw new Error("Dados inválidos");
  }
  const basic = buildBasic(username.trim(), password);
  return {
    basic,
    user: {
      id: "u_" + Math.random().toString(36).slice(2, 8),
      name: name.trim(),
      username: username.trim(),
      email: email?.trim() || undefined,
    },
  };
}

// Header Authorization
export function getAuthHeader(): Record<string,string> {
  const b = getBasic();
  return b ? { Authorization: `Basic ${b}` } : {};
}
