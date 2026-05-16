import { z } from "zod";

export const orderSchema = z.object({
  customerName: z.string().min(1, "고객명을 입력해주세요").max(50),
  phone: z.string().regex(/^01[0-9]{8,9}$/, "올바른 휴대폰 번호를 입력해주세요"),
  email: z.string().email("올바른 이메일을 입력해주세요"),
  filmType: z.string().min(1, "필름 종류를 입력해주세요").max(100),
  format: z.enum(["135", "120", "4x5", "8x10", "기타"], {
    message: "포맷을 선택해주세요",
  }),
  quantity: z.number().int().min(1).max(100),
  ei: z.string().max(20).optional(),
  scanType: z.enum(["없음", "JPG", "TIFF", "JPG+TIFF"], {
    message: "스캔 타입을 선택해주세요",
  }),
  process: z.enum(["C-41", "ECN-2", "B&W", "E-6", "기타"], {
    message: "현상 프로세스를 선택해주세요",
  }),
  pushPull: z.string().default("0"),
  pickupMethod: z.enum(["택배", "방문", "폐기"], {
    message: "수령 방법을 선택해주세요",
  }),
  notes: z.string().max(500).optional(),
  recaptchaToken: z.string().min(1),
});

export type OrderFormData = z.infer<typeof orderSchema>;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "접수대기",
  SHIPPED: "발송확인",
  PROCESSING: "작업중",
  DONE: "완료",
  EXPIRED: "만료",
  CANCELLED: "취소",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  DONE: "bg-green-100 text-green-800",
  EXPIRED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-800",
};
