"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncHandler = void 0;
const AsyncHandler = (
// Takes a RequestHandler function and an optional defaultError config
fn, defaultError) => {
    // returns a function that calls the given function, handles it's error
    // and returns it
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            return yield fn(req, res, next);
        }
        catch (error) {
            const code = (error === null || error === void 0 ? void 0 : error.statusCode) || (defaultError === null || defaultError === void 0 ? void 0 : defaultError.code) || 500;
            const message = error.message || (defaultError === null || defaultError === void 0 ? void 0 : defaultError.message);
            return res.status(code).json(Object.assign({ status: (_a = defaultError === null || defaultError === void 0 ? void 0 : defaultError.status) !== null && _a !== void 0 ? _a : "error" }, (typeof message === "string"
                ? { error: message }
                : { errors: message })));
        }
    });
};
exports.AsyncHandler = AsyncHandler;
