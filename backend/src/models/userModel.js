import { query } from "./db.js";

const DEMO_USERS = [
  {
    name: "Dr. Maya Carter",
    email: "doctor@hospital.ai",
    password: "Doctor@123",
    role: "Doctor",
  },
  {
    name: "Ariana Brooks",
    email: "admin@hospital.ai",
    password: "Admin@123",
    role: "Admin",
  },
  {
    name: "Nurse Daniel Singh",
    email: "nurse@hospital.ai",
    password: "Nurse@123",
    role: "Nurse",
  },
];

const ROLE_MAP = {
  doctor: "Doctor",
  admin: "Admin",
  nurse: "Nurse",
};

function normalizeRole(role) {
  const normalized = String(role || "").trim().toLowerCase();
  return ROLE_MAP[normalized] || "Doctor";
}

export async function ensureUsersTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS staff_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(80) NOT NULL,
      email VARCHAR(191) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('Doctor', 'Admin', 'Nurse') NOT NULL DEFAULT 'Doctor',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await query(sql);
}

export async function seedDemoUsersIfMissing() {
  for (const user of DEMO_USERS) {
    await query(
      `
      INSERT INTO staff_users (name, email, password, role)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        password = VALUES(password),
        role = VALUES(role)
      `,
      [user.name, user.email.toLowerCase(), user.password, user.role]
    );
  }
}

export async function findUserByEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const rows = await query(
    `
      SELECT id, name, email, password, role, created_at
      FROM staff_users
      WHERE email = ?
      LIMIT 1
    `,
    [normalizedEmail]
  );
  return rows[0] || null;
}

export async function getUserById(userId) {
  const rows = await query(
    `
      SELECT id, name, email, role, created_at
      FROM staff_users
      WHERE id = ?
      LIMIT 1
    `,
    [userId]
  );
  return rows[0] || null;
}

export async function createUser({ name, email, password, role }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const cleanName = String(name || "").trim();
  const normalizedRole = normalizeRole(role);

  const result = await query(
    `
      INSERT INTO staff_users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `,
    [cleanName, normalizedEmail, String(password || ""), normalizedRole]
  );

  return getUserById(result.insertId);
}
