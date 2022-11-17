"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
class HttpError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.HttpError = HttpError;
// import { Response } from "express";
// export const HttpError =
//   (res: Response) => (message: string | Array<string>, code: number) =>
//     res.status(code).json({
//   status: `${code}`.startsWith("4") ? "fail" : "error",
//   ...(typeof message === "string"
//     ? { error: message }
//     : { errors: message }),
// });
