import React from "react";
import Card from "@/components/ui/Card";
import EventForm from "@/components/forms/EventForm";
import type { Item } from "@/types/item";

export default function NewEventPage({ onSave }: { onSave: (it: Item) => void }) {
  return (
    <Card>
      <h2 className="mb-3 text-xl font-semibold">Novo evento</h2>
      <EventForm onSave={onSave} />
    </Card>
  );
}
