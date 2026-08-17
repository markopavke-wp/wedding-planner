#!/usr/bin/env node
/**
 * One-time Supabase setup for wedding-planner.
 * Uses service/secret key only for this script — do not commit secrets.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PROJECT_URL = "https://xhwusxayxngtalxujaip.supabase.co";
const SECRET = process.env.SUPABASE_SECRET_KEY;
if (!SECRET) {
  console.error("Missing SUPABASE_SECRET_KEY");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MIGRATION = path.join(
  ROOT,
  "supabase/migrations/20260817120000_initial_schema.sql",
);
const SEED = path.join(ROOT, "supabase/seed.sql");

const USERS = [
  {
    email: "petra@example.com",
    password: "Petra123!",
    full_name: "Petra Jovanović",
    role: "admin",
  },
  {
    email: "marko@example.com",
    password: "Marko123!",
    full_name: "Marko Nikolić",
    role: "admin",
  },
  {
    email: "ana@example.com",
    password: "Ana123!",
    full_name: "Ana Jovanović",
    role: "editor",
  },
  {
    email: "stefan@example.com",
    password: "Stefan123!",
    full_name: "Stefan Nikolić",
    role: "editor",
  },
];

async function authFetch(pathname, options = {}) {
  const res = await fetch(`${PROJECT_URL}${pathname}`, {
    ...options,
    headers: {
      apikey: SECRET,
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { ok: res.ok, status: res.status, body };
}

async function tryRunSql(sql) {
  const endpoints = [
    { path: "/pg/query", body: { query: sql } },
    { path: "/pg-meta/default/query", body: { query: sql } },
    { path: "/postgres/v1/query", body: { query: sql } },
  ];

  for (const ep of endpoints) {
    const res = await authFetch(ep.path, {
      method: "POST",
      body: JSON.stringify(ep.body),
    });
    console.log(`SQL via ${ep.path}: ${res.status}`);
    if (res.ok) return { ok: true, via: ep.path, body: res.body };
    console.log(typeof res.body === "string" ? res.body.slice(0, 200) : JSON.stringify(res.body).slice(0, 200));
  }
  return { ok: false };
}

async function createUsers() {
  const created = [];
  for (const user of USERS) {
    const res = await authFetch("/auth/v1/admin/users", {
      method: "POST",
      body: JSON.stringify({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          role: user.role,
        },
      }),
    });

    if (res.ok) {
      console.log(`✓ User created: ${user.email}`);
      created.push({ ...user, id: res.body.id });
      continue;
    }

    // Already exists → list and find
    if (res.status === 422 || res.status === 400) {
      console.log(`· User may already exist: ${user.email} (${res.status})`, JSON.stringify(res.body).slice(0, 150));
      created.push({ ...user, id: null });
      continue;
    }

    console.error(`✗ Failed ${user.email}:`, res.status, res.body);
  }
  return created;
}

async function updateProfiles(users) {
  // Prefer SQL; fallback to REST upsert if profiles table exists
  for (const user of users) {
    if (!user.id) continue;
    const res = await authFetch(`/rest/v1/profiles?id=eq.${user.id}`, {
      method: "PATCH",
      headers: {
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      }),
    });
    console.log(`Profile update ${user.email}: ${res.status}`);
  }
}

async function main() {
  console.log("1) Checking Auth Admin…");
  const list = await authFetch("/auth/v1/admin/users?page=1&per_page=5");
  console.log("Auth admin status:", list.status);

  console.log("\n2) Creating users…");
  const users = await createUsers();

  console.log("\n3) Running migration SQL…");
  const migration = fs.readFileSync(MIGRATION, "utf8");
  const mig = await tryRunSql(migration);
  if (!mig.ok) {
    console.log("\n⚠ Could not run SQL via API. Will create users only; you must run migration+seed in SQL Editor.");
  } else {
    console.log("✓ Migration OK via", mig.via);
    console.log("\n4) Running seed SQL…");
    const seed = fs.readFileSync(SEED, "utf8");
    const seedRes = await tryRunSql(seed);
    if (seedRes.ok) console.log("✓ Seed OK via", seedRes.via);
    else console.log("⚠ Seed failed via API");
  }

  // Refresh user list for profile updates after migration
  const all = await authFetch("/auth/v1/admin/users?page=1&per_page=50");
  if (all.ok && all.body?.users) {
    const byEmail = Object.fromEntries(
      all.body.users.map((u) => [u.email, u.id]),
    );
    for (const u of users) {
      u.id = byEmail[u.email] || u.id;
    }
    console.log("\n5) Updating profiles…");
    await updateProfiles(users);
  }

  console.log("\n=== LOGIN CREDENTIALS ===");
  for (const u of USERS) {
    console.log(`${u.email}  /  ${u.password}  (${u.role})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
