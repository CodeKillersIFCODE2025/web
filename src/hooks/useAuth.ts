import { useEffect, useState } from "react";
import { apiLogin, apiRegister, clearSession, getBasic, getUser, setSession, type AuthUser } from "@/lib/auth";

export function useAuth() {
  const [basic, setBasic] = useState<string | null>(() => getBasic());
  const [user,  setUser]  = useState<AuthUser | null>(() => getUser());
  const signedIn = !!basic && !!user;

  useEffect(() => {
    function sync() {
      setBasic(getBasic());
      setUser(getUser());
    }
    function onStorage(e: StorageEvent) {
      if (e.key === "auth_basic" || e.key === "auth_user") {
        sync();
      }
    }
    window.addEventListener("storage", onStorage);
    // 👇 evento customizado para a MESMA aba
    window.addEventListener("auth_storage_update", sync as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth_storage_update", sync as EventListener);
    };
  }, []);

  function logout() {
    localStorage.removeItem("auth_basic");
    localStorage.removeItem("auth_user");
    setBasic(null);
    clearSession();
    setUser(null);

    try {
      window.dispatchEvent(new StorageEvent("storage", { key: "auth_basic", newValue: null }));
      window.dispatchEvent(new StorageEvent("storage", { key: "auth_user", newValue: null }));
    } catch {
      window.dispatchEvent(new Event("auth_storage_update"));
    }
  }

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

  return { basic, user, signedIn, login, register, logout };
}
