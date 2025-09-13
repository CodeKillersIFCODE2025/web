import React from "react";
import Card from "@/components/ui/Card";
import EventForm from "@/components/forms/EventForm";
import type { Item } from "@/types/item";

export default function NewEventPage({ onSave }:{ onSave:(it: Item)=>void }) {
  return <Card><EventForm onSave={onSave} /></Card>;
}
