type AppealStatus = "NEW" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

const statusToRussian: Record<AppealStatus, string> = {
  NEW: "Новое",
  IN_PROGRESS: "В работе",
  COMPLETED: "Завершено",
  CANCELLED: "Отменено",
};

const russianToStatus: Record<string, AppealStatus> = {
  Новое: "NEW",
  "В работе": "IN_PROGRESS",
  Завершено: "COMPLETED",
  Отменено: "CANCELLED",
};

// Для API -> БД
export function mapRussianStatusToDb(status: string): AppealStatus {
  return russianToStatus[status] || "NEW";
}

// Для БД -> API
export function mapDbStatusToRussian(status: AppealStatus): string {
  return statusToRussian[status];
}
