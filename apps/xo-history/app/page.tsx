"use client";

import { useEffect } from "react";
import { CommitWave } from "@/components/CommitWave";
import { useVisualizer } from "@/lib/visualizer-store";

/**
 * Inset content for the xo-swarm-style shell (see ConditionalLayout): just the
 * commit wave stage. All chrome (sidebars, header, breadcrumb) lives in the
 * layout, and all state lives in the visualizer store, so this page could drop
 * straight into xo-swarm as a route.
 */
export default function Home() {
  const loadRepo = useVisualizer((s) => s.loadRepo);
  const commits = useVisualizer((s) => s.commits);
  const branch = useVisualizer((s) => s.branch);
  const replaySignal = useVisualizer((s) => s.replaySignal);
  const selected = useVisualizer((s) => s.selected);
  const selectCommit = useVisualizer((s) => s.selectCommit);
  const error = useVisualizer((s) => s.error);

  // Boot on sample data (no repo) once.
  useEffect(() => {
    loadRepo("");
  }, [loadRepo]);

  return (
    <section className="relative min-h-0 min-w-0 flex-1">
      {error && (
        <div className="pointer-events-none absolute bottom-4 left-6 z-10 max-w-[60%] truncate text-[11px] text-[#ff5d6c]">
          {error}
        </div>
      )}
      <CommitWave
        commits={commits}
        branch={branch}
        replaySignal={replaySignal}
        selectedIndex={selected}
        onSelect={selectCommit}
      />
    </section>
  );
}
