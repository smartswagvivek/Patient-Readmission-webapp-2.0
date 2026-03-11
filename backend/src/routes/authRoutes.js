import express from "express";
import { body } from "express-validator";
import { validationResult } from "express-validator";
import {
  loginController,
  meController,
  registerController,
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

export const router = express.Router();

const loginValidation = [
  body("email").exists().withMessage("email is required").isEmail(),
  body("password")
    .exists()
    .withMessage("password is required")
    .isString()
    .isLength({ min: 8 }),
  body("role")
    .optional()
    .isIn(["Doctor", "Admin", "Nurse", "doctor", "admin", "nurse"]),
];

const registerValidation = [
  body("name")
    .exists()
    .withMessage("name is required")
    .isString()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("name must be between 2 and 80 characters"),
  body("email").exists().withMessage("email is required").isEmail(),
  body("password")
    .exists()
    .withMessage("password is required")
    .isString()
    .isLength({ min: 8 })
    .withMessage("password must have at least 8 characters"),
  body("role")
    .exists()
    .withMessage("role is required")
    .isIn(["Doctor", "Admin", "Nurse", "doctor", "admin", "nurse"]),
];

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        message: "Validation failed",
        details: errors.array(),
      },
    });
  }
  return next();
}

router.post("/login", loginValidation, validateRequest, loginController);
router.post("/register", registerValidation, validateRequest, registerController);

router.get("/me", authenticateToken, meController);
