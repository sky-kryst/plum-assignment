import CSV from "csv-parse";
import { RequestHandler } from "express";
import fs from "fs";
import { z } from "zod";
import model from "../models";

export const getAll: RequestHandler = async (req, res, next) => {
  try {
    const { page, size } = req.query;

    const organizations = await model.organization.findMany({
      skip: Number(page ?? 0),
      take: Number(size ?? 5),
      include: {
        employees: true,
      },
    });

    return res.status(200).json({ status: "success", data: { organizations } });
  } catch (error: any) {
    return res.status(error?.cause?.code ?? 404).json({
      status: "error",
      error: error.message ?? "Not found",
    });
  }
};

export const createOne: RequestHandler = async (req, res, next) => {
  try {
    const { body } = req;

    if (!body || !body.name) {
      throw new Error("Request body should contain a name field.");
    }

    if (!isNaN(body.name)) {
      throw new Error("Organization name should be a string.");
    }

    if (body.name.length > 30) {
      throw new Error("Organization name cannot be more than 30 characters.");
    }

    if (body.name.length < 1) {
      throw new Error("Organization name should be more that 0 characters.");
    }

    const data = await model.organization.create({ data: { name: body.name } });

    return res
      .status(201)
      .json({ status: "success", data: { organization: data } });
  } catch (error: any) {
    return res.status(error?.cause?.code ?? 400).json({
      status: "error",
      error: error.message,
    });
  }
};

export const createEmployees: RequestHandler = async (req, res, next) => {
  try {
    const { file, params } = req;
    if (!params.orgId) {
      throw Error("Organization ID must be specified in the URL.");
    }

    const orgExists = await model.organization.findFirst({
      where: { id: params.orgId },
    });

    if (!orgExists) {
      throw Error("Organization does not exists.");
    }

    const csv = fs.readFileSync(file!.path);

    CSV.parse(csv, async (err, records) => {
      if (err) {
        throw err;
      }

      let data: any = [];

      const alphaSpaceRegex = /[a-zA-Z][a-zA-Z ]+/;

      const recordsSchema = z.object({
        id: z.number({
          required_error: "Employee ID field is missing",
          invalid_type_error: "Employee ID should be of type integer",
        }),
        firstName: z
          .string({
            required_error: "Employee ID field is missing",
            invalid_type_error: "Employee ID should be of type integer",
          })
          .min(3, "First Name too short")
          .regex(
            alphaSpaceRegex,
            "First name can only have alphabets or spaces"
          ),
        lastName: z
          .string({
            required_error: "Employee ID field is missing",
            invalid_type_error: "Employee ID should be of type integer",
          })
          .min(3, "First Name too short")
          .regex(
            alphaSpaceRegex,
            "Last name can only have alphabets or spaces"
          ),
        middleName: z.optional(
          z
            .string()
            .regex(
              alphaSpaceRegex,
              "Middle name can only have alphabets or spaces"
            )
        ),
        email: z
          .string({
            required_error: "Email field is missing",
          })
          .email("Invalid email format"),
        dob: z
          .string({
            required_error: "Date of birth is missing",
          })
          .regex(
            /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/,
            "Date should be in the dd/mm/yyyy format"
          ),
        gender: z.enum(["Male", "Female", "Other"], {
          required_error: "Gender field is empty",
          invalid_type_error: "Gender must be Male, Female or Other",
        }),
      });

      let success = true;
      let errors: Array<string | undefined> = [];

      records
        .slice(1)
        .forEach(
          (
            [id, firstName, middleName, lastName, email, dob, gender]: any,
            index: number
          ) => {
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
              validation.error.errors.forEach((error) =>
                errors.push(`${error.message} on row #${index + 1}`)
              );
            } else {
              data.push({ ...element, organizationId: params.orgId });
            }
          }
        );

      if (!!data.length) {
        await model.employee.createMany({
          data,
          skipDuplicates: true,
        });
      }

      return res
        .status(201)
        .json({ status: success ? "success" : "fail", errors });
    });
  } catch (error: any) {
    return res.status(error?.cause?.code ?? 400).json({
      status: "error",
      error: error.message,
    });
  }
};
