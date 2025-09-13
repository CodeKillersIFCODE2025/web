import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const iso = (d: Date) => format(d, "yyyy-MM-dd");
export const fmt = (d: Date, f: string) => format(d, f, { locale: ptBR });
export { ptBR };
