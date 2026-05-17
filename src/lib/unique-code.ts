import { customAlphabet } from "nanoid";
import { format } from "date-fns";

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 4);

export function generateUniqueCode(): string {
  const date = format(new Date(), "yyMMdd");
  const prefix = process.env.NEXT_PUBLIC_ORDER_CODE_PREFIX ?? "KDL";
  return `${prefix}-${date}-${nanoid()}`;
}
