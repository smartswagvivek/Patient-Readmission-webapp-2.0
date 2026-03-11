const users = [
  {
    id: 1,
    email: "doctor@hospital.ai",
    password: "Doctor@123",
    role: "Doctor",
    name: "Dr. Maya Carter",
  },
  {
    id: 2,
    email: "admin@hospital.ai",
    password: "Admin@123",
    role: "Admin",
    name: "Ariana Brooks",
  },
  {
    id: 3,
    email: "nurse@hospital.ai",
    password: "Nurse@123",
    role: "Nurse",
    name: "Nurse Daniel Singh",
  },
];

let nextUserId = users.length + 1;

export function getUsers() {
  return users;
}

export function findUserByEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  return users.find((user) => user.email.toLowerCase() === normalizedEmail) || null;
}

export function createUser({ email, password, role, name }) {
  const user = {
    id: nextUserId,
    email: String(email).trim().toLowerCase(),
    password: String(password),
    role: String(role),
    name: String(name),
  };

  nextUserId += 1;
  users.push(user);
  return user;
}

