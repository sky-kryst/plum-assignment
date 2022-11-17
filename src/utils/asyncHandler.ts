import { NextFunction, Request, RequestHandler, Response } from "express";

export const AsyncHandler = (
  // Takes a RequestHandler function and an optional defaultError config
  fn: RequestHandler,
  defaultError?: { code?: number; message?: string; status?: string }
) => {
  // returns a function that calls the given function, handles it's error
  // and returns it

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await fn(req, res, next);
    } catch (error: any) {
      const code = error?.statusCode || defaultError?.code || 500;
      const message = error.message || defaultError?.message;

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
