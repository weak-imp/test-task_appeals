import { Request, Response } from "express";
import { AppError } from "../middleware/errorHandler";
import {
  createAppealSchema,
  completeAppealSchema,
  cancelAppealSchema,
  getAppealsSchema,
} from "../types/appealSchemas";
import {
  createAppealService,
  getAppealByIdService,
  updateAppealStatusService,
  getAppealsService,
  cancelAllInProgressService,
} from "../services/appealService";
import { mapRussianStatusToDb } from "../utils/appealStatus";
import { Prisma } from "@prisma/client";

// Создать обращение
export const createAppeal = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parse = createAppealSchema.safeParse(req.body);
  if (!parse.success) {
    throw parse.error;
  }
  const { subject, text } = parse.data;
  const appeal = await createAppealService(subject, text);
  res.json(appeal);
};

// Взять в работу
export const takeAppeal = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = req.validatedId as number;
  const currentAppeal = await getAppealByIdService(id);
  if (!currentAppeal) {
    throw new AppError(404, "Обращение не найдено");
  }
  if (currentAppeal.status !== mapRussianStatusToDb("Новое")) {
    throw new AppError(400, "В работу можно взять только новое обращение");
  }
  const appeal = await updateAppealStatusService(id, "В работе");
  res.json(appeal);
};

// Завершить
export const completeAppeal = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = req.validatedId as number;
  const currentAppeal = await getAppealByIdService(id);
  if (!currentAppeal) {
    throw new AppError(404, "Обращение не найдено");
  }
  if (currentAppeal.status === mapRussianStatusToDb("Завершено")) {
    throw new AppError(400, "Нельзя завершить уже завершенное обращение");
  }
  if (currentAppeal.status === mapRussianStatusToDb("Отменено")) {
    throw new AppError(400, "Нельзя завершить отмененное обращение");
  }
  if (currentAppeal.status === mapRussianStatusToDb("Новое")) {
    throw new AppError(
      400,
      "Нельзя завершить новое обращение. Возьмите его в работу."
    );
  }
  const parseBody = completeAppealSchema.safeParse(req.body);
  if (!parseBody.success) {
    throw parseBody.error;
  }
  const { resolutionText } = parseBody.data;
  const appeal = await updateAppealStatusService(id, "Завершено", {
    resolution: resolutionText,
  });
  res.json(appeal);
};

// Отменить
export const cancelAppeal = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = req.validatedId as number;
  const currentAppeal = await getAppealByIdService(id);
  if (!currentAppeal) {
    throw new AppError(404, "Обращение не найдено");
  }
  if (currentAppeal.status === mapRussianStatusToDb("Завершено")) {
    throw new AppError(400, "Нельзя отменить завершенное обращение");
  }
  if (currentAppeal.status === mapRussianStatusToDb("Отменено")) {
    throw new AppError(400, "Нельзя отменить уже отмененное обращение");
  }
  if (currentAppeal.status === mapRussianStatusToDb("Новое")) {
    throw new AppError(
      400,
      "Нельзя отменить новое обращение. Возьмите его в работу."
    );
  }
  const parseBody = cancelAppealSchema.safeParse(req.body);
  if (!parseBody.success) {
    throw parseBody.error;
  }
  const { cancelReason } = parseBody.data;
  const appeal = await updateAppealStatusService(id, "Отменено", {
    cancelReason,
  });
  res.json(appeal);
};

// Получить список (с фильтрами)
export const getAppeals = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parse = getAppealsSchema.safeParse(req.query);
  if (!parse.success) {
    throw parse.error;
  }
  const { date, startDate, endDate } = parse.data;
  let filter: Prisma.AppealWhereInput = {};
  if (date) {
    try {
      const targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
        throw new AppError(400, "Некорректный формат даты");
      }
      const dateStr = targetDate.toISOString().split("T")[0];
      filter.createdAt = {
        gte: new Date(dateStr + "T00:00:00.000Z"),
        lt: new Date(dateStr + "T23:59:59.999Z"),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(400, "Некорректный формат даты");
    }
  } else if (startDate && endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new AppError(400, "Некорректный формат даты");
      }
      const startFilter = startDate.includes("T")
        ? start
        : new Date(start.toISOString().split("T")[0] + "T00:00:00.000Z");
      const endFilter = endDate.includes("T")
        ? end
        : new Date(end.toISOString().split("T")[0] + "T23:59:59.999Z");
      filter.createdAt = {
        gte: startFilter,
        lte: endFilter,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(400, "Некорректный формат даты");
    }
  }
  const appeals = await getAppealsService(filter);
  res.json(appeals);
};

// Отменить все "В работе"
export const cancelAllInProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  await cancelAllInProgressService();
  res.json({ message: "Все обращения со статусом 'В работе' отменены" });
};
