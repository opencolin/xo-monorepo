export interface Commit {
  hash: string; // abbreviated hash, for display
  fullHash?: string; // full 40-char SHA, used for unambiguous git lookups
  author: string;
  ts: number; // epoch ms
  subject: string;
  add: number; // insertions
  del: number; // deletions
}

export interface Branch {
  name: string;
  current: boolean;
  count: number; // commits on this branch
}

export interface CommitPayload {
  repo: string;
  branch: string;
  source: "git" | "sample";
  commits: Commit[];
}

export interface BranchPayload {
  repo: string;
  source: "git" | "sample";
  branches: Branch[];
}

export interface CommitFileChange {
  path: string;
  oldPath?: string; // set on renames
  add: number; // -1 for binary
  del: number; // -1 for binary
  binary: boolean;
}

/** Full metadata for a single commit, as much as git exposes. */
export interface CommitDetail {
  hash: string;
  shortHash: string;
  tree: string;
  parents: string[];
  author: { name: string; email: string; date: string };
  committer: { name: string; email: string; date: string };
  subject: string;
  body: string;
  refs: string[]; // branch/tag decorations
  encoding?: string;
  signature: { status: string; signer?: string; key?: string };
  notes?: string;
  files: CommitFileChange[];
  totalAdd: number;
  totalDel: number;
  filesChanged: number;
  source: "git" | "sample";
}

export interface CommitDetailPayload {
  detail: CommitDetail;
}
