import { NextRequest, NextResponse } from "next/server";
import { execFile, spawn } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, statSync } from "node:fs";
import http from "node:http";
import net from "node:net";
import { homedir, tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { isGitRepo } from "@/lib/gitLog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const run = promisify(execFile);

interface Preview {
  pid: number;
  port: number;
  worktree: string;
  repo: string;
  url: string;
  hash: string;
}

const g = globalThis as unknown as { __xoPreviews?: Map<string, Preview> };
const previews: Map<string, Preview> = (g.__xoPreviews ??= new Map());

function resolvePath(raw: string): string {
  return raw.startsWith("~/") ? resolve(homedir(), raw.slice(2)) : resolve(raw);
}

function detectPm(dir: string): "pnpm" | "yarn" | "bun" | "npm" {
  if (existsSync(join(dir, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(dir, "yarn.lock"))) return "yarn";
  if (existsSync(join(dir, "bun.lockb"))) return "bun";
  return "npm";
}

function installArgs(pm: string): string[] {
  if (pm === "npm") return ["install", "--no-audit", "--no-fund"];
  if (pm === "yarn") return ["install"];
  if (pm === "bun") return ["install"];
  return ["install", "--prefer-offline"]; // pnpm
}

function freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const srv = net.createServer();
    srv.unref();
    srv.on("error", rej);
    srv.listen(0, "127.0.0.1", () => {
      const port = (srv.address() as net.AddressInfo).port;
      srv.close(() => res(port));
    });
  });
}

function httpOk(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(
      { host: "127.0.0.1", port, path: "/", timeout: 2500 },
      (r) => {
        r.resume();
        resolve(true);
      },
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function teardown(p: Preview) {
  try {
    process.kill(-p.pid, "SIGTERM");
  } catch {
    /* group may already be gone */
  }
  try {
    await run("git", ["-C", p.repo, "worktree", "remove", "--force", p.worktree]);
  } catch {
    /* best effort */
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    repo?: string;
    hash?: string;
    install?: boolean;
  };
  const raw = body.repo?.trim();
  const hash = body.hash?.trim();
  const install = body.install === true;

  if (!raw) {
    return NextResponse.json(
      { error: "Live preview needs a real repository." },
      { status: 400 },
    );
  }
  if (!hash || !/^[0-9a-fA-F]{4,40}$/.test(hash)) {
    return NextResponse.json({ error: "Invalid commit hash" }, { status: 400 });
  }

  const repo = resolvePath(raw);
  if (!existsSync(repo) || !statSync(repo).isDirectory() || !isGitRepo(repo)) {
    return NextResponse.json({ error: `Not a git repo: ${repo}` }, { status: 400 });
  }

  const pkgPath = join(repo, "package.json");
  if (!existsSync(pkgPath)) {
    return NextResponse.json(
      { error: "No package.json at the repo root, cannot run a dev server." },
      { status: 400 },
    );
  }
  let scripts: Record<string, string> = {};
  try {
    scripts = JSON.parse(readFileSync(pkgPath, "utf8")).scripts ?? {};
  } catch {
    scripts = {};
  }
  const script = scripts.dev ? "dev" : scripts.start ? "start" : null;
  if (!script) {
    return NextResponse.json(
      { error: 'No "dev" or "start" script in package.json.' },
      { status: 400 },
    );
  }

  const pm = detectPm(repo);
  const port = await freePort();
  const worktree = join(
    tmpdir(),
    "xo-preview",
    `${hash.slice(0, 8)}-${randomUUID().slice(0, 8)}`,
  );

  // Detached worktree at the commit; the main working tree is never touched.
  try {
    await run("git", ["-C", repo, "worktree", "add", "--detach", worktree, hash]);
  } catch (e) {
    return NextResponse.json(
      { error: `git worktree failed: ${(e as Error).message}` },
      { status: 500 },
    );
  }

  const cleanupWorktree = () =>
    run("git", ["-C", repo, "worktree", "remove", "--force", worktree]).catch(
      () => {},
    );

  // Give the worktree a REAL node_modules so the dev server resolves deps
  // without reinstalling. A symlink is rejected by Turbopack ("Symlink
  // node_modules is invalid, it points out of the filesystem root"), so we
  // clone it instead: on macOS APFS `cp -Rc` is a copy-on-write clone (instant,
  // no extra disk); otherwise it falls back to a plain recursive copy.
  const srcNM = join(repo, "node_modules");
  if (existsSync(srcNM)) {
    const dstNM = join(worktree, "node_modules");
    try {
      await run("cp", ["-Rc", srcNM, dstNM]);
    } catch {
      try {
        await run("cp", ["-R", srcNM, dstNM]);
      } catch {
        /* dev server will report missing modules if this fails */
      }
    }
  }
  // Env files are small; copy them in directly.
  for (const f of [
    ".env",
    ".env.local",
    ".env.development",
    ".env.development.local",
  ]) {
    const src = join(repo, f);
    const dst = join(worktree, f);
    if (existsSync(src) && !existsSync(dst)) {
      try {
        copyFileSync(src, dst);
      } catch {
        /* non-fatal */
      }
    }
  }

  // Reconcile dependencies to this commit's lockfile. The clone gives a warm
  // cache; install adds/adjusts only what differs (e.g. a package the commit
  // needs that the current checkout doesn't have).
  if (install) {
    try {
      await run(pm, installArgs(pm), {
        cwd: worktree,
        timeout: 360000,
        maxBuffer: 64 * 1024 * 1024,
        env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      });
    } catch (e) {
      await cleanupWorktree();
      const msg = (e as Error).message.split("\n").slice(0, 10).join("\n");
      return NextResponse.json(
        { error: "Dependency install failed.", log: msg },
        { status: 500 },
      );
    }
  }

  const args = ["run", script];
  let child;
  try {
    child = spawn(pm, args, {
      cwd: worktree,
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        PORT: String(port),
        BROWSER: "none",
        NEXT_TELEMETRY_DISABLED: "1",
        FORCE_COLOR: "0",
      },
    });
  } catch (e) {
    await cleanupWorktree();
    return NextResponse.json(
      { error: `Could not launch "${pm} ${args.join(" ")}": ${(e as Error).message}` },
      { status: 500 },
    );
  }

  // Capture output so we can (a) report real errors and (b) detect the port the
  // dev server actually bound to, in case it ignores PORT and picks its own.
  let out = "";
  let detectedPort = port;
  const onData = (buf: Buffer) => {
    out += buf.toString();
    if (out.length > 32000) out = out.slice(-32000);
    const m = out.match(/https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)/);
    if (m) detectedPort = parseInt(m[1], 10);
  };
  child.stdout?.on("data", onData);
  child.stderr?.on("data", onData);

  let exited = false;
  let exitMsg = "";
  child.on("error", (err) => {
    exited = true;
    exitMsg = err.message;
  });
  child.on("exit", (code, signal) => {
    exited = true;
    if (!exitMsg) exitMsg = `dev server exited early (code ${code ?? "?"}${signal ? `, ${signal}` : ""})`;
  });

  const tail = () => out.split("\n").filter(Boolean).slice(-12).join("\n");

  if (!child.pid) {
    await cleanupWorktree();
    return NextResponse.json(
      {
        error: `Could not start "${pm} ${args.join(" ")}". Is ${pm} on PATH?`,
      },
      { status: 500 },
    );
  }

  // Wait until the server answers, the process exits, or we time out (90s).
  const start = Date.now();
  let ready = false;
  while (Date.now() - start < 90000) {
    if (exited) break;
    if (await httpOk(detectedPort)) {
      ready = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 700));
  }

  if (!ready) {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      /* ignore */
    }
    await cleanupWorktree();
    const reason = exited
      ? exitMsg
      : "the dev server did not respond within 90s";
    return NextResponse.json(
      {
        error: `Preview failed: ${reason}.`,
        log: tail(),
      },
      { status: 502 },
    );
  }

  const id = randomUUID();
  const url = `http://localhost:${detectedPort}`;
  previews.set(id, {
    pid: child.pid,
    port: detectedPort,
    worktree,
    repo,
    url,
    hash,
  });

  return NextResponse.json({
    id,
    url,
    port: detectedPort,
    command: `${pm} run ${script}`,
    shortHash: hash.slice(0, 7),
  });
}

export async function DELETE(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { id?: string };
  const id = body.id;
  if (!id || !previews.has(id)) {
    return NextResponse.json({ ok: true });
  }
  const p = previews.get(id)!;
  await teardown(p);
  previews.delete(id);
  return NextResponse.json({ ok: true });
}
