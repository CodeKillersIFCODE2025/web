export type ItemType = "event" | "med";

export type Item = {
  id: string;
  type: ItemType;
  title: string;
  date: string;   // yyyy-MM-dd
  time?: string;  // HH:mm
  description?: string;
  dose?: string;  // p/ med/proced.
};
