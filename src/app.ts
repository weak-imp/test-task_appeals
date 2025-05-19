import express, { Request, Response, NextFunction } from "express";
import { errorHandler, AppError } from "./middleware/errorHandler";
import appealsRouter from "./routes";

const app = express();

app.use(
  express.json({
    verify: (req, res, buf, encoding) => {
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        throw new AppError(400, "Некорректный JSON в теле запроса");
      }
    },
  })
);

app.use("/api/appeals", appealsRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(404, "Маршрут не найден"));
});

app.use(errorHandler);

export default app;
