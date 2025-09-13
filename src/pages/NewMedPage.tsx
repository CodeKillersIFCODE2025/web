import React from "react";
import Card from "@/components/ui/Card";
import EventForm from "@/components/forms/EventForm"; // mesmo form!
import type { Item } from "@/types/item";

export default function NewMedPage({ onSave }: { onSave: (it: Item) => void }) {
  return (
    <Card>
      <h2 className="mb-3 text-xl font-semibold">Novo remédio/procedimento</h2>
      <EventForm mode="med" onSave={onSave} />
    </Card>
  );
}
