"use client";

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="grid min-h-[30dvh] place-items-center text-sm text-black/50" role="status">
      <span className="flex items-center gap-3">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/15 border-t-blueBrand-600" />
        {label}
      </span>
    </div>
  );
}

export function LoadError({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
      {message}{" "}
      {retry ? (
        <button type="button" className="font-semibold underline" onClick={retry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}
