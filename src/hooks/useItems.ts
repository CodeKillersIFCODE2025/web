import { useEffect, useState } from "react";
import type { Item } from "@/types/item";
import { readJSON, writeJSON } from "@/lib/storage";

export function useItems() {
  const [items, setItems] = useState<Item[]>(() => readJSON<Item[]>() ?? []);

  useEffect(() => {
    writeJSON(items);
  }, [items]);

  function upsert(it: Item) {
    setItems((prev) => {
      const i = prev.findIndex((p) => p.id === it.id);
      if (i >= 0) { const next = prev.slice(); next[i] = it; return next; }
      return [...prev, it];
    });
  }
  const removeById = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));

  return { items, setItems, upsert, removeById };
}
