import { NextFunction, Request, Response } from "express";

export const AsyncHandler = (
  // Takes a RequestHandler function and an optional defaultError config
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
  defaultError?: { code?: number; message?: string; status?: string }
) => {
  // returns a function that calls the given function, handles it's error
  // and returns it

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await fn(req, res, next);
    } catch (error: any) {
      const code = defaultError?.code || error?.statusCode || 500;
      const message = defaultError?.message || error.message;

      return res.status(code).json({
        status: defaultError?.status ?? "error",
        ...(typeof message === "string"
          ? { error: message }
          : { errors: message }),
      });
    }
  };
};

export type TAsyncHandler = typeof AsyncHandler;
