export class HttpError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);

    Error.captureStackTrace(this, this.constructor);
  }
}

// import { Response } from "express";
// export const HttpError =
//   (res: Response) => (message: string | Array<string>, code: number) =>
//     res.status(code).json({
//   status: `${code}`.startsWith("4") ? "fail" : "error",
//   ...(typeof message === "string"
//     ? { error: message }
//     : { errors: message }),
// });
