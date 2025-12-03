import { useEffect, useState, useRef } from "react";

interface OmikujiProps {
  entries: { id: number; name: string }[];
  isSpinning: boolean;
  winnerIndex: number;
  onSpinComplete: () => void;
  spinDuration: number;
  accentColor: string;
}

export function Omikuji({
  entries,
  isSpinning,
  winnerIndex,
  onSpinComplete,
  spinDuration,
  accentColor,
}: OmikujiProps) {
  const [phase, setPhase] = useState<"idle" | "shaking" | "drawing" | "revealed">("idle");
  const [stickPosition, setStickPosition] = useState(0);
  const entriesRef = useRef(entries);
  const stickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep entriesRef in sync
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const winner = entries.length > 0 ? entries[winnerIndex] : null;

  useEffect(() => {
    // Clear any existing interval
    if (stickIntervalRef.current) {
      clearInterval(stickIntervalRef.current);
      stickIntervalRef.current = null;
    }

    if (!isSpinning || entries.length === 0) {
      setPhase("idle");
      setStickPosition(0);
      return;
    }

    setPhase("shaking");
    
    const shakeTime = spinDuration * 500;
    const drawTime = spinDuration * 400;

    const drawTimer = setTimeout(() => {
      if (entriesRef.current.length === 0) return;
      
      setPhase("drawing");
      
      let pos = 0;
      stickIntervalRef.current = setInterval(() => {
        pos += 5;
        setStickPosition(Math.min(pos, 100));
        if (pos >= 100 && stickIntervalRef.current) {
          clearInterval(stickIntervalRef.current);
          stickIntervalRef.current = null;
        }
      }, 30);

      setTimeout(() => {
        if (stickIntervalRef.current) {
          clearInterval(stickIntervalRef.current);
          stickIntervalRef.current = null;
        }
        if (entriesRef.current.length > 0) {
          setStickPosition(100);
          setPhase("revealed");
        }
      }, drawTime);
    }, shakeTime);

    const completeTimer = setTimeout(() => {
      if (entriesRef.current.length > 0) {
        onSpinComplete();
      }
    }, shakeTime + drawTime + 500);

    return () => {
      if (stickIntervalRef.current) {
        clearInterval(stickIntervalRef.current);
        stickIntervalRef.current = null;
      }
      clearTimeout(drawTimer);
      clearTimeout(completeTimer);
    };
  }, [isSpinning, winnerIndex, spinDuration, onSpinComplete, entries.length]);

  const getShakeAnimation = () => {
    if (phase === "shaking") {
      return "animate-omikuji-shake";
    }
    return "";
  };

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/50">
        参加者を追加してください
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <style>{`
        @keyframes omikuji-shake {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-15deg); }
          30% { transform: rotate(15deg); }
          45% { transform: rotate(-12deg); }
          60% { transform: rotate(12deg); }
          75% { transform: rotate(-8deg); }
          90% { transform: rotate(8deg); }
        }
        .animate-omikuji-shake {
          animation: omikuji-shake 0.4s infinite;
          transform-origin: bottom center;
        }
        @keyframes stick-wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-2deg); }
          75% { transform: rotate(2deg); }
        }
        .animate-stick-wiggle {
          animation: stick-wiggle 0.3s ease-in-out infinite;
        }
        @keyframes blessing-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-blessing {
          animation: blessing-glow 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className={`relative ${getShakeAnimation()}`}>
        <div 
          className="relative w-36 h-52"
          style={{
            background: `linear-gradient(180deg, #8B0000 0%, #660000 100%)`,
            borderRadius: "10px 10px 0 0",
            boxShadow: `0 10px 30px rgba(0,0,0,0.5), inset 0 -5px 15px rgba(0,0,0,0.3)`,
          }}
        >
          <div 
            className="absolute -top-2 left-0 right-0 h-6 rounded-t-lg"
            style={{
              background: `linear-gradient(180deg, ${accentColor} 0%, #B8860B 100%)`,
              boxShadow: `0 2px 4px rgba(0,0,0,0.3)`,
            }}
          />

          <div 
            className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full"
            style={{
              background: "#1a1a2e",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.8)",
            }}
          />

          <div 
            className="absolute top-14 left-1/2 -translate-x-1/2 text-center"
            style={{ color: accentColor }}
          >
            <div className="text-3xl font-bold" style={{ fontFamily: "serif" }}>御</div>
            <div className="text-3xl font-bold" style={{ fontFamily: "serif" }}>籤</div>
          </div>

          <div 
            className="absolute bottom-8 left-4 right-4 h-12 opacity-30"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                ${accentColor} 0,
                ${accentColor} 2px,
                transparent 2px,
                transparent 8px
              )`,
            }}
          />

          <div 
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-44 h-5 rounded"
            style={{
              background: `linear-gradient(180deg, #4a3728 0%, #2d1f14 100%)`,
              boxShadow: `0 4px 8px rgba(0,0,0,0.4)`,
            }}
          />
        </div>

        {(phase === "drawing" || phase === "revealed") && (
          <div 
            className={`absolute left-1/2 -translate-x-1/2 ${phase === "drawing" ? "animate-stick-wiggle" : ""}`}
            style={{
              bottom: `${150 + stickPosition}px`,
              width: "8px",
              height: "120px",
              background: `linear-gradient(90deg, #DEB887 0%, #F5DEB3 50%, #DEB887 100%)`,
              borderRadius: "2px",
              boxShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              transformOrigin: "bottom center",
            }}
          >
            {phase === "revealed" && winner && (
              <div 
                className="absolute -top-16 left-1/2 -translate-x-1/2 animate-blessing"
                style={{ minWidth: "200px" }}
              >
                <div 
                  className="px-6 py-3 rounded-lg text-center"
                  style={{
                    background: "linear-gradient(180deg, #FFF8DC 0%, #F5DEB3 100%)",
                    border: `3px solid ${accentColor}`,
                    boxShadow: `0 0 20px ${accentColor}40`,
                  }}
                >
                  <div 
                    className="text-sm mb-1"
                    style={{ color: "#8B0000" }}
                  >
                    大吉
                  </div>
                  <div 
                    className="text-2xl md:text-3xl font-bold"
                    style={{ 
                      color: "#8B0000",
                      fontFamily: "serif",
                    }}
                  >
                    {winner.name}
                  </div>
                </div>
              </div>
            )}

            <div 
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: "#8B0000",
                color: accentColor,
              }}
            >
              壱
            </div>
          </div>
        )}
      </div>

      <div 
        className="text-xl font-bold mt-8"
        style={{ color: accentColor }}
      >
        {phase === "shaking" && "おみくじを振っています..."}
        {phase === "drawing" && "運命の棒が出てきます..."}
        {phase === "revealed" && `大吉！ ${winner?.name} さん！`}
        {phase === "idle" && "おみくじを引いてください"}
      </div>
    </div>
  );
}
