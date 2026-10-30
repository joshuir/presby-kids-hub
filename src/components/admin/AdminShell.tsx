"use client";

/** The CMS draws its own full-screen layout (sidebar, top bar); this wrapper just hands over. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
