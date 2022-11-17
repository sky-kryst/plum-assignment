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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmployees = exports.createOne = exports.getAll = void 0;
const csv_parse_1 = __importDefault(require("csv-parse"));
const fs_1 = __importDefault(require("fs"));
const zod_1 = require("zod");
const models_1 = __importDefault(require("../models"));
const asyncHandler_1 = require("./../utils/asyncHandler");
const httpError_1 = require("./../utils/httpError");
exports.getAll = (0, asyncHandler_1.AsyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, size } = req.query;
    const organizations = yield models_1.default.organization.findMany({
        skip: Number(page !== null && page !== void 0 ? page : 0),
        take: Number(size !== null && size !== void 0 ? size : 5),
        include: {
            employees: true,
        },
    });
    return res.status(200).json({ status: "success", data: { organizations } });
}), { code: 404, message: "Not Found" });
exports.createOne = (0, asyncHandler_1.AsyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body } = req;
    if (!body || !body.name) {
        throw new httpError_1.HttpError("Request body should contain a name field.", 400);
    }
    if (!isNaN(body.name)) {
        throw new httpError_1.HttpError("Organization name should be a string.", 400);
    }
    if (body.name.length > 30) {
        throw new httpError_1.HttpError("Organization name cannot be more than 30 characters.", 400);
    }
    if (body.name.length < 1) {
        throw new httpError_1.HttpError("Organization name should be more that 0 characters.", 400);
    }
    const data = yield models_1.default.organization.create({ data: { name: body.name } });
    return res
        .status(201)
        .json({ status: "success", data: { organization: data } });
}));
exports.createEmployees = (0, asyncHandler_1.AsyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { file, params } = req;
    if (!params.orgId) {
        throw Error("Organization ID must be specified in the URL.");
    }
    const orgExists = yield models_1.default.organization.findFirst({
        where: { id: params.orgId },
    });
    if (!orgExists) {
        throw new httpError_1.HttpError("Organization does not exists.", 400);
    }
    const csv = fs_1.default.readFileSync(file.path);
    csv_parse_1.default.parse(csv, (err, records) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (err) {
                throw err;
            }
            let data = [];
            const alphaSpaceRegex = /[a-zA-Z][a-zA-Z ]+/;
            const recordsSchema = zod_1.z.object({
                id: zod_1.z.number({
                    required_error: "Employee ID field is missing",
                    invalid_type_error: "Employee ID should be of type integer",
                }),
                firstName: zod_1.z
                    .string({
                    required_error: "Employee ID field is missing",
                    invalid_type_error: "Employee ID should be of type integer",
                })
                    .min(3, "First Name too short")
                    .regex(alphaSpaceRegex, "First name can only have alphabets or spaces"),
                lastName: zod_1.z
                    .string({
                    required_error: "Employee ID field is missing",
                    invalid_type_error: "Employee ID should be of type integer",
                })
                    .min(3, "First Name too short")
                    .regex(alphaSpaceRegex, "Last name can only have alphabets or spaces"),
                middleName: zod_1.z.optional(zod_1.z
                    .string()
                    .regex(alphaSpaceRegex, "Middle name can only have alphabets or spaces")),
                email: zod_1.z
                    .string({
                    required_error: "Email field is missing",
                })
                    .email("Invalid email format"),
                dob: zod_1.z
                    .string({
                    required_error: "Date of birth is missing",
                })
                    .regex(/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/, "Date should be in the dd/mm/yyyy format"),
                gender: zod_1.z.enum(["Male", "Female", "Other"], {
                    required_error: "Gender field is empty",
                    invalid_type_error: "Gender must be Male, Female or Other",
                }),
            });
            let success = true;
            let errors = [];
            records
                .slice(1)
                .forEach(([id, firstName, middleName, lastName, email, dob, gender], index) => {
                const element = {
                    id: Number(id),
                    firstName,
                    lastName,
                    middleName: middleName || undefined,
                    email,
                    dob,
                    gender,
                };
                const validation = recordsSchema.safeParse(element);
                if (!validation.success) {
                    success = success && validation.success;
                    validation.error.errors.forEach((error) => errors.push(`${error.message} on row #${index + 1}`));
                }
                else {
                    data.push(Object.assign(Object.assign({}, element), { organizationId: params.orgId }));
                }
            });
            if (!!data.length) {
                yield models_1.default.employee.createMany({
                    data,
                    skipDuplicates: true,
                });
            }
            return res.status(201).json(Object.assign({ status: success ? "success" : "fail" }, (errors.length ? { errors } : null)));
        }
        catch (error) {
            return res.status(500).json({
                status: "error",
                error: error.message,
            });
        }
    }));
}));
