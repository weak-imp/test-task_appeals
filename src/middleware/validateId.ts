import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const IdSchema = z.string().regex(/^\d+$/).transform(Number);

export function validateId(req: Request, res: Response, next: NextFunction) {
  const validation = IdSchema.safeParse(req.params.id);
  if (!validation.success) {
    res.status(400).json({ error: "Некорректный ID" });
    return;
  }

  req.validatedId = validation.data;
  next();
}
