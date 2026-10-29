"use client";

import { useEffect, useState } from "react";
import { adminList, whoami } from "@/lib/cms/client";
import type { LessonDoc } from "@/lib/cms/types";

/** Signed-in admins can preview draft/scheduled lessons from the CMS. */
export function useAdminLessons(enabled: boolean) {
  const [list, setList] = useState<LessonDoc[] | null>(null);
  useEffect(() => {
    if (!enabled) return;
    whoami()
      .then((me) => (me?.admin ? adminList("lessons") : null))
      .then((l) => l && setList(l))
      .catch(() => {});
  }, [enabled]);
  return list;
}
