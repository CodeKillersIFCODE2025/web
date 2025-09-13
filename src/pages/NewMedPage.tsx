import React from "react";
import Card from "@/components/ui/Card";
import MedForm from "@/components/forms/MedForm";
import type { Item } from "@/types/item";

export default function NewMedPage({ onSave }:{ onSave:(it: Item)=>void }) {
  return <Card><MedForm onSave={onSave} /></Card>;
}
