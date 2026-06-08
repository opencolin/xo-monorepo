import { NextRequest, NextResponse } from "next/server";
import { existsSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { isGitRepo, readGitLog } from "@/lib/gitLog";
import { sampleCommits } from "@/lib/sampleData";
import { CommitPayload } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function resolvePath(raw: string): string {
  return raw.startsWith("~/") ? resolve(homedir(), raw.slice(2)) : resolve(raw);
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("repo")?.trim();
  const branch = req.nextUrl.searchParams.get("branch")?.trim() || "main";

  if (!raw) {
    const payload: CommitPayload = {
      repo: "sample",
      branch,
      source: "sample",
      commits: sampleCommits(branch),
    };
    return NextResponse.json(payload);
  }

  const dir = resolvePath(raw);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    return NextResponse.json({ error: `Not a folder: ${dir}` }, { status: 400 });
  }
  if (!isGitRepo(dir)) {
    return NextResponse.json(
      { error: `No .git found in: ${dir}` },
      { status: 400 },
    );
  }

  try {
    const commits = await readGitLog(dir, branch);
    const payload: CommitPayload = {
      repo: dir,
      branch,
      source: "git",
      commits,
    };
    return NextResponse.json(payload);
  } catch (e) {
    return NextResponse.json(
      { error: `git log failed: ${(e as Error).message}` },
      { status: 500 },
    );
  }
}
