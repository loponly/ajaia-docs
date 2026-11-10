import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";
import { showToast } from "./Toast";

type Patch = { title?: string; html?: string };
export type SaveStatus = "saved" | "saving" | "error";

// Collects title/html edits and sends them in one PATCH 800 ms after the last change.
export function useAutosave(docId: string) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const pending = useRef<Patch>({});
  const timer = useRef<number>();

  const flush = useCallback(async () => {
    const patch = pending.current;
    if (!Object.keys(patch).length) return;
    pending.current = {};
    try {
      await api(`/api/docs/${docId}`, "PATCH", patch);
      setStatus(Object.keys(pending.current).length ? "saving" : "saved");
    } catch (e) {
      pending.current = { ...patch, ...pending.current };
      setStatus("error");
      showToast((e as Error).message);
    }
  }, [docId]);

  const save = useCallback(
    (patch: Patch) => {
      Object.assign(pending.current, patch);
      setStatus("saving");
      clearTimeout(timer.current);
      timer.current = window.setTimeout(flush, 800);
    },
    [flush],
  );

  // Don't lose edits made just before leaving the page.
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      void flush();
    },
    [flush],
  );

  return { status, save };
}
