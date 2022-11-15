import { createEmployees } from "./../controllers/organizations";
import express from "express";
import { getAll, createOne } from "../controllers/organizations";
import multer from "multer";
import os from "os";

const multerParse = multer({ dest: os.tmpdir() });

const router = express.Router();

router.get("/", getAll);
router.post("/create", createOne);
router.post(
  "/:orgId/members/upload",
  multerParse.single("file"),
  createEmployees
);

export default router;
