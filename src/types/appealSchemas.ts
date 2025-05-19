import { z } from "zod";

export const createAppealSchema = z.object({
  subject: z.string().min(1, "Тема обращения обязательна"),
  text: z.string().min(1, "Текст обращения обязателен"),
});

export const completeAppealSchema = z.object({
  resolutionText: z.string().min(1, "Решение обязательно"),
});

export const cancelAppealSchema = z.object({
  cancelReason: z.string().min(1, "Причина отмены обязательна"),
});

const dateSchema = z
  .string()
  .optional()
  .refine(
    (val) =>
      !val || /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)?$/.test(val),
    {
      message:
        "Неверный формат даты. Ожидается формат YYYY-MM-DD или YYYY-MM-DDTHH:mm:ss.sssZ",
    }
  );

export const getAppealsSchema = z
  .object({
    date: dateSchema.optional(),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
  })
  .refine((data) => !(data.date && (data.startDate || data.endDate)), {
    message: "Нельзя использовать date вместе с startDate/endDate",
    path: ["date"],
  })
  .refine(
    (data) => {
      if (data.startDate && !data.endDate) return false;
      if (!data.startDate && data.endDate) return false;
      return true;
    },
    {
      message: "Параметры startDate и endDate должны использоваться в паре",
      path: ["startDate"],
    }
  );
