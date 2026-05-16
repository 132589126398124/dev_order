import { customAlphabet } from "nanoid";
import { format } from "date-fns";

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 4);

export function generateUniqueCode(): string {
  const date = format(new Date(), "yyMMdd");
  return `KDL-${date}-${nanoid()}`;
}
