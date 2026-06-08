import { create } from "zustand";
import { sampleDetail } from "@/lib/sampleData";
import {
  Branch,
  BranchPayload,
  Commit,
  CommitDetail,
  CommitDetailPayload,
  CommitPayload,
} from "@/lib/types";

/**
 * Single client store for the visualizer, mirroring xo-swarm's `lib/*-store.ts`
 * zustand pattern so the sidebar, header, and stage can all read/drive the same
 * state without prop drilling (the shape xo-swarm uses for its own surfaces).
 */
interface VisualizerState {
  path: string;
  repoLabel: string;
  isGit: boolean;
  branches: Branch[];
  branch: string;
  commits: Commit[];
  loading: boolean;
  error: string;
  replaySignal: number;
  selected: number | null;

  // expanded detail modal
  detail: CommitDetail | null;
  detailOpen: boolean;
  detailLoading: boolean;
  detailError: string;

  loadRepo: (path: string) => Promise<void>;
  loadCommits: (branch: string) => Promise<void>;
  selectBranch: (name: string) => Promise<void>;
  pickFolder: () => Promise<void>;
  replay: () => void;
  selectCommit: (i: number) => void;
  clearSelected: () => void;
  openDetail: () => Promise<void>;
  closeDetail: () => void;
}

export const useVisualizer = create<VisualizerState>((set, get) => ({
  path: "",
  repoLabel: "sample data",
  isGit: false,
  branches: [],
  branch: "main",
  commits: [],
  loading: false,
  error: "",
  replaySignal: 0,
  selected: null,

  detail: null,
  detailOpen: false,
  detailLoading: false,
  detailError: "",

  loadCommits: async (branch) => {
    set({ loading: true, error: "" });
    try {
      const qs = new URLSearchParams({ branch });
      const repoPath = get().path.trim();
      if (repoPath) qs.set("repo", repoPath);
      const res = await fetch(`/api/commits?${qs}`);
      const data = (await res.json()) as CommitPayload & { error?: string };
      if (!res.ok || data.error) throw new Error(data.error || "load failed");
      set({ commits: data.commits, branch: data.branch, selected: null });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  loadRepo: async (path) => {
    set({ path, error: "", selected: null, detailOpen: false });
    try {
      const qs = path ? `?repo=${encodeURIComponent(path)}` : "";
      const res = await fetch(`/api/branches${qs}`);
      const data = (await res.json()) as BranchPayload & { error?: string };
      if (!res.ok || data.error) throw new Error(data.error || "load failed");
      const isGit = data.source === "git";
      set({
        branches: data.branches,
        isGit,
        repoLabel: isGit ? data.repo : "sample data",
      });
      const first =
        data.branches.find((b) => b.current)?.name ||
        data.branches[0]?.name ||
        "main";
      await get().loadCommits(first);
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  selectBranch: async (name) => {
    await get().loadCommits(name);
  },

  pickFolder: async () => {
    set({ loading: true, error: "" });
    try {
      const res = await fetch("/api/pick-folder");
      const data = (await res.json()) as {
        path?: string;
        canceled?: boolean;
        error?: string;
      };
      if (!res.ok || data.error) throw new Error(data.error || "picker failed");
      if (data.canceled || !data.path) return;
      await get().loadRepo(data.path);
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  replay: () => set((s) => ({ replaySignal: s.replaySignal + 1 })),

  selectCommit: (i) =>
    set((s) => ({ selected: s.selected === i ? null : i })),

  clearSelected: () => set({ selected: null }),

  openDetail: async () => {
    const { selected, commits, isGit, path } = get();
    if (selected === null || !commits[selected]) return;
    const commit = commits[selected];
    set({ detailOpen: true, detailError: "" });
    if (!isGit) {
      set({ detail: sampleDetail(commit) });
      return;
    }
    set({ detail: null, detailLoading: true });
    try {
      const qs = new URLSearchParams({ repo: path.trim(), hash: commit.hash });
      const res = await fetch(`/api/commit?${qs}`);
      const data = (await res.json()) as CommitDetailPayload & {
        error?: string;
      };
      if (!res.ok || data.error) throw new Error(data.error || "load failed");
      set({ detail: data.detail });
    } catch (e) {
      set({ detailError: (e as Error).message });
    } finally {
      set({ detailLoading: false });
    }
  },

  closeDetail: () => set({ detailOpen: false }),
}));
