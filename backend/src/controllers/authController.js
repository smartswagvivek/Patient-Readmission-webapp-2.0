import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  getUserById,
} from "../models/userModel.js";
import {
  createUser as createDemoUser,
  findUserByEmail as findDemoUserByEmail,
} from "../config/demoUsers.js";

const JWT_SECRET = process.env.JWT_SECRET || "patient-readmission-dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "12h";

export async function loginController(req, res, next) {
  const { email, password } = req.body;

  try {
    const normalizedEmail = String(email || "").trim().toLowerCase();

    let account = null;
    try {
      account = await findUserByEmail(normalizedEmail);
    } catch {
      account = findDemoUserByEmail(normalizedEmail);
    }

    if (!account) {
      account = findDemoUserByEmail(normalizedEmail);
    }

    if (!account || account.password !== password) {
      return res.status(401).json({
        error: {
          message: "Invalid email or password.",
        },
      });
    }

    const token = jwt.sign(
      {
        sub: account.id,
        email: account.email,
        role: account.role,
        name: account.name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      token,
      user: {
        id: account.id,
        email: account.email,
        role: account.role,
        name: account.name,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function registerController(req, res, next) {
  const { name, email, password, role } = req.body;

  try {
    let existingUser = null;
    try {
      existingUser = await findUserByEmail(email);
    } catch {
      existingUser = findDemoUserByEmail(email);
    }

    if (!existingUser) {
      existingUser = findDemoUserByEmail(email);
    }

    if (existingUser) {
      return res.status(409).json({
        error: {
          message: "An account with this email already exists.",
        },
      });
    }

    let createdUser = null;
    try {
      createdUser = await createUser({
        name: String(name || "").trim(),
        email,
        password,
        role: String(role || "Doctor").trim(),
      });
    } catch {
      createdUser = createDemoUser({
        name: String(name || "").trim(),
        email,
        password,
        role: String(role || "Doctor").trim(),
      });
    }

    const token = jwt.sign(
      {
        sub: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
        name: createdUser.name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      token,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
        name: createdUser.name,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function meController(req, res, next) {
  try {
    let user = null;
    try {
      user = await getUserById(req.user.id);
    } catch {
      user = findDemoUserByEmail(req.user.email);
    }

    if (!user) {
      return res.json({
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
          name: req.user.name,
        },
      });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    return next(error);
  }
}
