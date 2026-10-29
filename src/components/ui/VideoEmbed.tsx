"use client";

function youTubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m?.[1] ?? null;
}

function vimeoId(url: string) {
  return url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1] ?? null;
}

/** Plays YouTube, Vimeo, or uploaded video files (mp4/webm). */
export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const yt = youTubeId(url);
  const vm = vimeoId(url);
  const src = yt
    ? `https://www.youtube-nocookie.com/embed/${yt}?rel=0`
    : vm
      ? `https://player.vimeo.com/video/${vm}`
      : null;
  return (
    <div className="overflow-hidden rounded-3xl bg-black shadow-card ring-1 ring-black/5">
      {src ? (
        <iframe
          src={src}
          title={title}
          className="aspect-video w-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video src={url} controls preload="metadata" playsInline className="aspect-video w-full" title={title} />
      )}
    </div>
  );
}
