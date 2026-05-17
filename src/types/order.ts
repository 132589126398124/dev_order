import { z } from "zod";

export const filmItemSchema = z.object({
  filmType: z.string().min(1, "필름 종류를 입력해주세요").max(100),
  format: z.enum(["135", "120", "4x5", "8x10", "기타"], { message: "포맷을 선택해주세요" }),
  quantity: z.number().int().min(1).max(100),
  ei: z.string().max(20).optional(),
  scanType: z.enum(["없음", "JPG", "TIFF", "JPG+TIFF"], { message: "스캔 타입을 선택해주세요" }),
  scanResolution: z.enum(["standard", "high"]).default("standard"),
  process: z.enum(["C-41", "ECN-2", "B&W", "E-6", "기타"], { message: "현상 프로세스를 선택해주세요" }),
  pushPull: z.string().default("0"),
  halfFrame: z.boolean().default(false),
});

export const orderSchema = z.object({
  customerName: z.string().min(1, "고객명을 입력해주세요").max(50),
  phone: z.string().regex(/^01[0-9]{8,9}$/, "올바른 휴대폰 번호를 입력해주세요"),
  email: z.string().email("올바른 이메일을 입력해주세요"),
  filmItems: z.array(filmItemSchema).min(1, "최소 1개의 필름을 추가해주세요"),
  pickupMethod: z.enum(["택배", "방문", "폐기"], { message: "수령 방법을 선택해주세요" }),
  deliveryAddress: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
  recaptchaToken: z.string().min(1),
}).superRefine((data, ctx) => {
  if (data.pickupMethod === "택배" && !data.deliveryAddress?.trim()) {
    ctx.addIssue({ code: "custom", path: ["deliveryAddress"], message: "반송 주소를 입력해주세요" });
  }
});

export type FilmItem = z.infer<typeof filmItemSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;

export const DEFAULT_FILM_ITEM: FilmItem = {
  filmType: "",
  format: "135",
  quantity: 1,
  ei: "",
  scanType: "JPG",
  scanResolution: "standard",
  process: "C-41",
  pushPull: "0",
  halfFrame: false,
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "접수대기",
  SHIPPED: "발송확인",
  PROCESSING: "작업중",
  DONE: "완료",
  EXPIRED: "만료",
  CANCELLED: "취소",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  SHIPPED: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  PROCESSING: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  DONE: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  EXPIRED: "bg-slate-50 text-slate-500 ring-1 ring-slate-200",
  CANCELLED: "bg-red-50 text-red-700 ring-1 ring-red-200",
};
