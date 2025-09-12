import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const timeAgo = (date: Date): string => {
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
};
