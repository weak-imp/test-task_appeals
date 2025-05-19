import prisma from "../../prisma/prisma-client";
import { Prisma } from "@prisma/client";
import {
  mapDbStatusToRussian,
  mapRussianStatusToDb,
} from "../utils/appealStatus";

export async function createAppealService(subject: string, text: string) {
  const appeal = await prisma.appeal.create({
    data: { topic: subject, text, status: mapRussianStatusToDb("Новое") },
  });
  return { ...appeal, status: mapDbStatusToRussian(appeal.status) };
}

export async function getAppealByIdService(id: number) {
  return prisma.appeal.findUnique({ where: { id } });
}

export async function updateAppealStatusService(
  id: number,
  status: string,
  extra: Partial<{ resolution: string; cancelReason: string }> = {}
) {
  const data: any = { status: mapRussianStatusToDb(status) };
  if (extra.resolution !== undefined) data.resolution = extra.resolution;
  if (extra.cancelReason !== undefined) data.cancelReason = extra.cancelReason;
  const appeal = await prisma.appeal.update({ where: { id }, data });
  return { ...appeal, status: mapDbStatusToRussian(appeal.status) };
}

export async function getAppealsService(filter: Prisma.AppealWhereInput) {
  const appeals = await prisma.appeal.findMany({
    where: filter,
    orderBy: { createdAt: "desc" },
  });
  return appeals.map((a) => ({ ...a, status: mapDbStatusToRussian(a.status) }));
}

export async function cancelAllInProgressService() {
  await prisma.appeal.updateMany({
    where: { status: mapRussianStatusToDb("В работе") },
    data: {
      status: mapRussianStatusToDb("Отменено"),
      cancelReason: "Массовая отмена",
    },
  });
}
