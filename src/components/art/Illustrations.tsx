/* Original flat illustrations used across the site (no external assets). */

type KidProps = { x: number; y: number; s?: number; skin?: string; shirt: string; hair?: "puffs" | "short" | "bun"; arms?: "up" | "down" | "wave"; flip?: boolean };

export function Kid({ x, y, s = 1, skin = "#7A4A2A", shirt, hair = "short", arms = "down", flip }: KidProps) {
  const armL = arms === "up" ? "M-22 8 L-40 -32" : arms === "wave" ? "M-22 8 L-44 -20" : "M-22 8 L-30 42";
  const armR = arms === "up" ? "M22 8 L40 -32" : "M22 8 L30 42";
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d={armL} stroke={skin} strokeWidth="10" strokeLinecap="round" />
      <path d={armR} stroke={skin} strokeWidth="10" strokeLinecap="round" />
      <path d="M-26 8 Q0 -6 26 8 L30 66 Q0 76 -30 66 Z" fill={shirt} />
      <circle cx="0" cy="-22" r="24" fill={skin} />
      {hair === "puffs" ? (
        <>
          <circle cx="-22" cy="-42" r="12" fill="#1B1B1F" />
          <circle cx="22" cy="-42" r="12" fill="#1B1B1F" />
          <path d="M-24 -26 Q0 -54 24 -26 Q12 -38 -24 -26" fill="#1B1B1F" />
        </>
      ) : hair === "bun" ? (
        <>
          <circle cx="0" cy="-50" r="11" fill="#1B1B1F" />
          <path d="M-24 -22 Q0 -56 24 -22 Q10 -36 -24 -22" fill="#1B1B1F" />
        </>
      ) : (
        <path d="M-24 -24 Q-22 -50 0 -48 Q22 -50 24 -24 Q12 -36 -24 -24" fill="#1B1B1F" />
      )}
      <circle cx="-8" cy="-22" r="2.6" fill="#1B1B1F" />
      <circle cx="8" cy="-22" r="2.6" fill="#1B1B1F" />
      <path d="M-8 -11 Q0 -4 8 -11" stroke="#1B1B1F" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="-15" cy="-14" r="3.5" fill="#F472B6" opacity=".35" />
      <circle cx="15" cy="-14" r="3.5" fill="#F472B6" opacity=".35" />
    </g>
  );
}

/** Two children beside an open Bible with rays of light (home hero). */
export function HeroArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 460 420" className={className} role="img" aria-label="Two children with an open Bible">
      <rect x="20" y="20" width="420" height="380" rx="40" fill="#fff" stroke="#0B1530" strokeWidth="6" />
      <g stroke="#FFD27A" strokeWidth="12" strokeLinecap="round">
        {[-62, -40, -20, 0, 20, 40, 62].map((a) => (
          <line key={a} x1="230" y1="215" x2={230 + Math.sin((a * Math.PI) / 180) * 210} y2={215 - Math.cos((a * Math.PI) / 180) * 200} data-ray />
        ))}
      </g>
      <g data-book>
        <path d="M120 200 Q175 182 230 210 L230 300 Q175 274 120 290 Z" fill="#fff" stroke="#0B1530" strokeWidth="6" strokeLinejoin="round" />
        <path d="M340 200 Q285 182 230 210 L230 300 Q285 274 340 290 Z" fill="#fff" stroke="#0B1530" strokeWidth="6" strokeLinejoin="round" />
        {[0, 1, 2].map((i) => (
          <g key={i} stroke="#AFC6FF" strokeWidth="6" strokeLinecap="round">
            <path d={`M140 ${222 + i * 20} Q175 ${212 + i * 20} 210 ${226 + i * 20}`} fill="none" />
            <path d={`M250 ${226 + i * 20} Q285 ${212 + i * 20} 320 ${222 + i * 20}`} fill="none" />
          </g>
        ))}
      </g>
      <g data-kid-left>
        <Kid x={95} y={300} s={1.05} shirt="#FF7A59" hair="puffs" arms="up" />
      </g>
      <g data-kid-right>
        <Kid x={375} y={305} s={1} shirt="#60A5FA" hair="short" />
      </g>
    </svg>
  );
}

/** Children singing with music notes (Sunday section). */
export function SingingArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 340" className={className} role="img" aria-label="Children singing together">
      <rect width="420" height="340" rx="36" fill="#FFE7A6" />
      <circle cx="330" cy="70" r="90" fill="#FFF4D6" />
      {[[80, 70], [160, 40], [270, 90], [350, 50]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`} data-note>
          <ellipse cx="0" cy="22" rx="10" ry="8" fill="#0B1530" />
          <rect x="7" y="-14" width="5" height="36" fill="#0B1530" />
          <path d="M12 -14 Q24 -10 22 4" stroke="#0B1530" strokeWidth="5" fill="none" />
        </g>
      ))}
      <Kid x={120} y={250} shirt="#FACC15" hair="short" arms="up" />
      <Kid x={210} y={240} s={1.1} shirt="#F472B6" hair="puffs" arms="up" />
      <Kid x={300} y={252} shirt="#6366F1" hair="bun" arms="up" />
    </svg>
  );
}

const GROUP_BG: Record<string, string> = { beginners: "#FFE7A6", primary: "#DDE8FF", juniors: "#FDE2E2", seniors: "#D9F5E5" };

/** Small scene per age group (class cards, mega menu). */
export function GroupArt({ group, className }: { group: string; className?: string }) {
  const bg = GROUP_BG[group] ?? "#EAF1FF";
  return (
    <svg viewBox="0 0 320 180" className={className} role="img" aria-hidden>
      <rect width="320" height="180" fill={bg} />
      {group === "beginners" ? (
        <>
          <rect x="150" y="70" width="16" height="80" rx="4" fill="#8B5E3C" />
          <circle cx="158" cy="62" r="48" fill="#60A5FA" />
          {[[135, 50], [175, 45], [158, 80], [125, 78], [190, 76]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="6" fill={["#F472B6", "#FACC15", "#fff", "#FB923C", "#A7F3D0"][i]} />
          ))}
          <Kid x={70} y={150} s={0.6} shirt="#F59E0B" hair="puffs" arms="wave" />
          <Kid x={250} y={150} s={0.6} shirt="#EF4444" hair="short" arms="up" />
        </>
      ) : group === "primary" ? (
        <>
          <g stroke="#FFD27A" strokeWidth="8" strokeLinecap="round" opacity=".9">
            {[-50, -25, 0, 25, 50].map((a) => (
              <line key={a} x1="160" y1="110" x2={160 + Math.sin((a * Math.PI) / 180) * 110} y2={110 - Math.cos((a * Math.PI) / 180) * 100} />
            ))}
          </g>
          <path d="M90 105 Q125 92 160 110 L160 160 Q125 146 90 156 Z" fill="#fff" stroke="#0B1530" strokeWidth="4" />
          <path d="M230 105 Q195 92 160 110 L160 160 Q195 146 230 156 Z" fill="#fff" stroke="#0B1530" strokeWidth="4" />
          <Kid x={55} y={155} s={0.55} shirt="#FB7185" hair="bun" />
          <Kid x={268} y={155} s={0.55} shirt="#22C55E" hair="short" />
        </>
      ) : group === "juniors" ? (
        <>
          <circle cx="250" cy="45" r="26" fill="#FFF4D6" />
          {[[200, 40], [235, 85], [275, 95]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(.7)`}>
              <ellipse cx="0" cy="22" rx="10" ry="8" fill="#0B1530" />
              <rect x="7" y="-14" width="5" height="36" fill="#0B1530" />
            </g>
          ))}
          <Kid x={130} y={150} s={0.7} shirt="#3B82F6" hair="short" />
          <g transform="translate(150 118) rotate(-25)">
            <ellipse cx="0" cy="0" rx="22" ry="16" fill="#B45309" />
            <rect x="18" y="-4" width="52" height="7" rx="3" fill="#78350F" />
            <circle cx="0" cy="0" r="5" fill="#451A03" />
          </g>
        </>
      ) : (
        <>
          <path d="M0 180 L90 70 L150 130 L210 50 L320 180 Z" fill="#86EFAC" />
          <path d="M210 50 L232 78 L188 78 Z" fill="#fff" />
          <rect x="206" y="20" width="4" height="34" fill="#0B1530" />
          <path d="M210 20 L236 28 L210 36 Z" fill="#EF4444" />
          <Kid x={120} y={160} s={0.55} shirt="#8B5CF6" hair="puffs" arms="up" />
          <Kid x={170} y={165} s={0.55} shirt="#0EA5E9" hair="short" arms="up" />
        </>
      )}
    </svg>
  );
}

/** Generic picture placeholder for gallery albums without photos yet. */
export function AlbumArt({ seed, className, label }: { seed: number; className?: string; label?: string }) {
  const palettes = [
    ["#FFE7A6", "#F59E0B", "#FB923C"],
    ["#DDE8FF", "#3B82F6", "#22C55E"],
    ["#FDE2E2", "#F472B6", "#EF4444"],
    ["#D9F5E5", "#22C55E", "#0EA5E9"],
    ["#EDE9FE", "#8B5CF6", "#FACC15"],
  ];
  const [bg, a, b] = palettes[seed % palettes.length];
  return (
    <svg viewBox="0 0 400 300" className={className} role="img" aria-label={label ?? "Illustration"} preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="300" fill={bg} />
      <circle cx={80 + (seed * 37) % 240} cy="70" r="40" fill="#fff" opacity=".6" />
      <path d="M0 300 Q100 200 200 250 T400 220 V300 Z" fill={a} opacity=".35" />
      <Kid x={130} y={250} s={0.85} shirt={a} hair={seed % 2 ? "puffs" : "short"} arms="up" />
      <Kid x={270} y={255} s={0.8} shirt={b} hair={seed % 3 ? "short" : "bun"} arms={seed % 2 ? "wave" : "up"} />
    </svg>
  );
}
