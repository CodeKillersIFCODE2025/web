import { useEffect, useState } from "react";
import { apiLogin, apiRegister, clearSession, getBasic, getUser, setSession, type AuthUser } from "@/lib/auth";

export function useAuth() {
  const [basic, setBasic] = useState<string | null>(() => getBasic());
  const [user,  setUser]  = useState<AuthUser | null>(() => getUser());
  const signedIn = !!basic && !!user;

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "auth_basic" || e.key === "auth_user") {
        setBasic(getBasic());
        setUser(getUser());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  async function login(username: string, password: string) {
    const { basic, user } = await apiLogin(username, password);
    setSession(basic, user);
    setBasic(basic);
    setUser(user);
  }

  async function register(name: string, username: string, password: string, email?: string) {
    const { basic, user } = await apiRegister(name, username, password, email);
    setSession(basic, user);
    setBasic(basic);
    setUser(user);
  }

  function logout() {
    clearSession();
    setBasic(null);
    setUser(null);
  }

  return { basic, user, signedIn, login, register, logout };
}
