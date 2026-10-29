"use client";

import { useState } from "react";
import type { ClassDoc } from "@/lib/cms/types";
import type { Child } from "@/lib/parent";
import { Field, PrimaryButton, inputCls } from "@/components/forms/Field";

export function ChildForm({ child, classes, onSave, onCancel, preset }: { child?: Child; classes: ClassDoc[]; onSave: (c: Partial<Child>) => Promise<void>; onCancel?: () => void; preset?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setBusy(true);
        setErr("");
        try {
          await onSave({
            id: child?.id,
            name: String(fd.get("name")).trim(),
            birthDate: String(fd.get("birth_date") || "") || null,
            classId: String(fd.get("class_id") || "") || null,
            notes: String(fd.get("notes") ?? ""),
          });
        } catch (x) {
          setErr((x as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <Field label="Child’s name"><input name="name" required defaultValue={child?.name} className={inputCls} /></Field>
      <Field label="Date of birth"><input name="birth_date" type="date" defaultValue={child?.birthDate ?? ""} className={inputCls} /></Field>
      <Field label="Class" className="sm:col-span-2" hint="Changing the class sends it to a teacher for confirmation.">
        <select name="class_id" defaultValue={child?.classId ?? preset ?? ""} className={inputCls}>
          <option value="">Not sure — please advise</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.ageRange})</option>)}
        </select>
      </Field>
      <Field label="Care notes (allergies, medical, pick-up)" className="sm:col-span-2"><textarea name="notes" rows={3} defaultValue={child?.notes} className={inputCls} /></Field>
      {err ? <div className="text-sm text-red-700 sm:col-span-2">{err}</div> : null}
      <div className="flex gap-3 sm:col-span-2">
        <PrimaryButton type="submit" disabled={busy}>{busy ? "Saving…" : child ? "Save changes" : "Add child"}</PrimaryButton>
        {onCancel ? <button type="button" onClick={onCancel} className="rounded-full px-5 py-3 text-sm font-bold text-black/60 hover:bg-black/5">Cancel</button> : null}
      </div>
    </form>
  );
}
