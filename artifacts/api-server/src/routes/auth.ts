import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  createSession,
  destroySession,
  getSessionUser,
  hashPassword,
  publicUser,
  verifyPassword,
} from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/signup", async (req, res) => {
  const { email, password, name } = (req.body ?? {}) as {
    email?: string;
    password?: string;
    name?: string;
  };
  if (!email || !password || !name) {
    res.status(400).json({ message: "Email, password, and name are required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ message: "Password must be at least 8 characters" });
    return;
  }
  const normalizedEmail = email.trim().toLowerCase();
  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail));
  if (existing) {
    res.status(409).json({ message: "An account with that email already exists" });
    return;
  }
  const [user] = await db
    .insert(usersTable)
    .values({
      email: normalizedEmail,
      name: name.trim(),
      passwordHash: hashPassword(password),
    })
    .returning();
  await createSession(user.id, res);
  res.json({ user: publicUser(user) });
  return;
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = (req.body ?? {}) as {
    email?: string;
    password?: string;
  };
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }
  const normalizedEmail = email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail));
  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }
  await createSession(user.id, res);
  res.json({ user: publicUser(user) });
  return;
});

router.post("/auth/logout", async (req, res) => {
  await destroySession(req, res);
  res.json({ message: "Logged out" });
  return;
});

router.get("/auth/me", async (req, res) => {
  const user = await getSessionUser(req);
  res.json({ user: user ? publicUser(user) : null });
  return;
});

export default router;
