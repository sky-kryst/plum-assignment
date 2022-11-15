"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const organizations_1 = require("./../controllers/organizations");
const express_1 = __importDefault(require("express"));
const organizations_2 = require("../controllers/organizations");
const multer_1 = __importDefault(require("multer"));
const os_1 = __importDefault(require("os"));
const multerParse = (0, multer_1.default)({ dest: os_1.default.tmpdir() });
const router = express_1.default.Router();
router.get("/", organizations_2.getAll);
router.post("/create", organizations_2.createOne);
router.post("/:orgId/members/upload", multerParse.single("file"), organizations_1.createEmployees);
exports.default = router;
