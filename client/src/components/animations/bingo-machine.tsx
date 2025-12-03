import { useEffect, useState, useRef } from "react";

interface BingoMachineProps {
  entries: { id: number; name: string }[];
  isSpinning: boolean;
  winnerIndex: number;
  onSpinComplete: () => void;
  spinDuration: number;
  accentColor: string;
}

const BALL_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
  "#FFEAA7", "#DDA0DD", "#F8B500", "#00CED1",
  "#E74C3C", "#3498DB", "#2ECC71", "#9B59B6"
];

export function BingoMachine({
  entries,
  isSpinning,
  winnerIndex,
  onSpinComplete,
  spinDuration,
  accentColor,
}: BingoMachineProps) {
  const [phase, setPhase] = useState<"idle" | "spinning" | "ejecting" | "revealed">("idle");
  const [balls, setBalls] = useState<{ x: number; y: number; color: string; rotation: number }[]>([]);
  const [ejectingBall, setEjectingBall] = useState<{ x: number; y: number; scale: number } | null>(null);
  const animationRef = useRef<number | null>(null);
  const winner = entries[winnerIndex];
  const ballColor = BALL_COLORS[winnerIndex % BALL_COLORS.length];

  useEffect(() => {
    const initialBalls = Array.from({ length: Math.min(entries.length, 12) }, (_, i) => ({
      x: 30 + Math.random() * 140,
      y: 30 + Math.random() * 80,
      color: BALL_COLORS[i % BALL_COLORS.length],
      rotation: Math.random() * 360,
    }));
    setBalls(initialBalls);
  }, [entries.length]);

  useEffect(() => {
    if (!isSpinning) return;

    setPhase("spinning");
    setEjectingBall(null);
    const spinDurationMs = spinDuration * 700;
    const startTime = Date.now();

    const animateBalls = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / spinDurationMs, 1);
      const speed = 1 - progress * 0.8;

      setBalls(prev => prev.map((ball, i) => ({
        ...ball,
        x: 30 + ((ball.x - 30 + speed * 3 + Math.sin(Date.now() / 100 + i) * 2) % 140),
        y: 30 + ((ball.y - 30 + Math.cos(Date.now() / 100 + i) * speed * 2 + 80) % 80),
        rotation: ball.rotation + speed * 10,
      })));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateBalls);
      } else {
        setPhase("ejecting");
      }
    };

    animationRef.current = requestAnimationFrame(animateBalls);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpinning, spinDuration]);

  useEffect(() => {
    if (phase !== "ejecting") return;

    setEjectingBall({ x: 100, y: 140, scale: 0.5 });
    
    let y = 140;
    let scale = 0.5;
    
    const animateEject = () => {
      y += 3;
      scale = Math.min(scale + 0.02, 1.5);
      
      setEjectingBall({ x: 100, y, scale });

      if (y < 250) {
        animationRef.current = requestAnimationFrame(animateEject);
      } else {
        setPhase("revealed");
        setTimeout(onSpinComplete, 500);
      }
    };

    setTimeout(() => {
      animationRef.current = requestAnimationFrame(animateEject);
    }, 300);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [phase, onSpinComplete]);

  useEffect(() => {
    if (!isSpinning) {
      setPhase("idle");
    }
  }, [isSpinning]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" data-testid="bingo-machine">
        <svg width="220" height="300" viewBox="0 0 220 300">
          <defs>
            <linearGradient id="cageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#555" />
              <stop offset="50%" stopColor="#888" />
              <stop offset="100%" stopColor="#555" />
            </linearGradient>
            <clipPath id="cageClip">
              <ellipse cx="110" cy="80" rx="80" ry="60" />
            </clipPath>
          </defs>

          <ellipse 
            cx="110" cy="80" rx="85" ry="65" 
            fill="none" 
            stroke={accentColor}
            strokeWidth="6"
          />
          
          <ellipse 
            cx="110" cy="80" rx="80" ry="60" 
            fill="rgba(0,0,0,0.3)"
          />
          
          <g clipPath="url(#cageClip)">
            {balls.map((ball, i) => (
              <g 
                key={i}
                transform={`translate(${ball.x}, ${ball.y}) rotate(${ball.rotation})`}
              >
                <circle
                  r="15"
                  fill={ball.color}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="2"
                />
                <ellipse
                  cx="-5"
                  cy="-5"
                  rx="4"
                  ry="3"
                  fill="rgba(255,255,255,0.4)"
                />
              </g>
            ))}
          </g>

          <path
            d="M 85 140 L 85 160 Q 85 180 110 180 Q 135 180 135 160 L 135 140"
            fill="url(#cageGradient)"
            stroke="#333"
            strokeWidth="2"
          />

          <ellipse
            cx="110"
            cy="200"
            rx="20"
            ry="10"
            fill="#444"
            stroke="#333"
            strokeWidth="2"
          />

          {ejectingBall && (
            <g transform={`translate(${ejectingBall.x}, ${ejectingBall.y}) scale(${ejectingBall.scale})`}>
              <circle
                r="25"
                fill={ballColor}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="3"
                filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
              />
              <ellipse
                cx="-8"
                cy="-8"
                rx="6"
                ry="4"
                fill="rgba(255,255,255,0.5)"
              />
              {phase === "revealed" && (
                <text
                  x="0"
                  y="5"
                  textAnchor="middle"
                  fontSize={winner?.name && winner.name.length > 3 ? "8" : "10"}
                  fontWeight="bold"
                  fill="#000"
                >
                  {winner?.name && winner.name.length > 5 ? winner.name.slice(0, 5) + "…" : winner?.name}
                </text>
              )}
            </g>
          )}

          <rect
            x="60"
            y="260"
            width="100"
            height="30"
            rx="5"
            fill="#333"
            stroke={accentColor}
            strokeWidth="2"
          />
        </svg>

        {phase === "spinning" && (
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80 text-lg animate-pulse"
            style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
          >
            ガラガラ...
          </div>
        )}
      </div>

      {phase === "revealed" && (
        <p className="text-xl font-bold" style={{ color: accentColor }}>
          {winner?.name}
        </p>
      )}
    </div>
  );
}
