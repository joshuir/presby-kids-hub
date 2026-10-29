import type { PostDoc } from "@/lib/cms/types";

const TONES: Record<string, [string, string, string]> = {
  "Bible Stories": ["#1D4ED8", "#60A5FA", "📜"],
  Devotionals: ["#0A1F44", "#3B82F6", "🙏"],
  "Parent Guides": ["#12306B", "#93C5FD", "👨‍👩‍👧"],
  "Kids Activities": ["#2563EB", "#FFC83D", "🎨"],
};

/** Uploaded cover, or a generated gradient cover per category. */
export function PostCover({ post, className = "" }: { post: PostDoc; className?: string }) {
  if (post.cover) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={post.cover} alt="" loading="lazy" className={`object-cover ${className}`} />;
  }
  const [a, b, icon] = TONES[post.category] ?? TONES["Bible Stories"];
  return (
    <div className={`relative grid place-items-center overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} aria-hidden>
      <span className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
      <span className="absolute -bottom-10 -left-4 h-40 w-40 rounded-full bg-white/10" />
      <span className="text-6xl drop-shadow">{icon}</span>
    </div>
  );
}
