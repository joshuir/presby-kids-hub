export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <defs>
        <linearGradient id="lg-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#0A1F44" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#lg-mark)" />
      {/* dove */}
      <path d="M12 27c5-1 8-4 10-8 1 4 4 6 8 6l6-4-1 6c-2 5-7 8-13 8-5 0-9-3-10-8z" fill="#fff" />
      <circle cx="31" cy="22" r="1.4" fill="#0A1F44" />
      <path d="M22 19c-1-4 1-8 5-9-1 3 0 6 2 8" fill="#BFDBFE" />
    </svg>
  );
}
