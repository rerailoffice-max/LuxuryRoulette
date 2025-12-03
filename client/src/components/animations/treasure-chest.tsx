import { useEffect, useState, useRef } from "react";

interface TreasureChestProps {
  entries: { id: number; name: string }[];
  isSpinning: boolean;
  winnerIndex: number;
  onSpinComplete: () => void;
  spinDuration: number;
  accentColor: string;
}

export function TreasureChest({
  entries,
  isSpinning,
  winnerIndex,
  onSpinComplete,
  spinDuration,
  accentColor,
}: TreasureChestProps) {
  const [phase, setPhase] = useState<"idle" | "shaking" | "opening" | "revealed">("idle");
  const [displayIndex, setDisplayIndex] = useState(0);
  const entriesRef = useRef(entries);
  const shuffleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep entriesRef in sync
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const winner = entries.length > 0 ? entries[winnerIndex] : null;

  useEffect(() => {
    // Clear any existing interval
    if (shuffleIntervalRef.current) {
      clearInterval(shuffleIntervalRef.current);
      shuffleIntervalRef.current = null;
    }

    if (!isSpinning || entries.length === 0) {
      setPhase("idle");
      return;
    }

    setPhase("shaking");
    
    shuffleIntervalRef.current = setInterval(() => {
      const currentEntries = entriesRef.current;
      if (currentEntries.length > 0) {
        setDisplayIndex(Math.floor(Math.random() * currentEntries.length));
      }
    }, 100);

    const shakeTime = spinDuration * 600;
    const openTime = spinDuration * 300;

    const openTimer = setTimeout(() => {
      if (shuffleIntervalRef.current) {
        clearInterval(shuffleIntervalRef.current);
        shuffleIntervalRef.current = null;
      }
      if (entriesRef.current.length > 0) {
        setPhase("opening");
      }
    }, shakeTime);

    const revealTimer = setTimeout(() => {
      if (entriesRef.current.length > 0) {
        setPhase("revealed");
        setDisplayIndex(winnerIndex);
      }
    }, shakeTime + openTime);

    const completeTimer = setTimeout(() => {
      if (entriesRef.current.length > 0) {
        onSpinComplete();
      }
    }, shakeTime + openTime + 500);

    return () => {
      if (shuffleIntervalRef.current) {
        clearInterval(shuffleIntervalRef.current);
        shuffleIntervalRef.current = null;
      }
      clearTimeout(openTimer);
      clearTimeout(revealTimer);
      clearTimeout(completeTimer);
    };
  }, [isSpinning, winnerIndex, entries.length, spinDuration, onSpinComplete]);

  const getShakeAnimation = () => {
    if (phase === "shaking") {
      return "animate-shake";
    }
    return "";
  };

  const getLidRotation = () => {
    if (phase === "opening" || phase === "revealed") {
      return "-70deg";
    }
    return "0deg";
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
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          10% { transform: translateX(-5px) rotate(-2deg); }
          20% { transform: translateX(5px) rotate(2deg); }
          30% { transform: translateX(-5px) rotate(-1deg); }
          40% { transform: translateX(5px) rotate(1deg); }
          50% { transform: translateX(-3px) rotate(-2deg); }
          60% { transform: translateX(3px) rotate(2deg); }
          70% { transform: translateX(-3px) rotate(-1deg); }
          80% { transform: translateX(3px) rotate(1deg); }
          90% { transform: translateX(-2px) rotate(0deg); }
        }
        .animate-shake {
          animation: shake 0.3s infinite;
        }
        @keyframes float-up {
          0% { transform: translateY(50px) scale(0.5); opacity: 0; }
          50% { transform: translateY(-10px) scale(1.1); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-float-up {
          animation: float-up 0.6s ease-out forwards;
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        .animate-sparkle {
          animation: sparkle 1s ease-in-out infinite;
        }
      `}</style>

      <div className={`relative ${getShakeAnimation()}`}>
        {phase === "revealed" && (
          <>
            <div 
              className="absolute -top-8 -left-8 w-6 h-6 animate-sparkle"
              style={{ color: accentColor, animationDelay: "0s" }}
            >
              ✦
            </div>
            <div 
              className="absolute -top-6 -right-6 w-4 h-4 animate-sparkle"
              style={{ color: accentColor, animationDelay: "0.3s" }}
            >
              ✦
            </div>
            <div 
              className="absolute top-4 -right-10 w-5 h-5 animate-sparkle"
              style={{ color: accentColor, animationDelay: "0.6s" }}
            >
              ✦
            </div>
          </>
        )}

        <div 
          className="relative w-56 h-40 rounded-lg"
          style={{
            background: `linear-gradient(180deg, #8B4513 0%, #5D2E0C 50%, #3D1F08 100%)`,
            boxShadow: `0 10px 30px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.1)`,
            border: `4px solid #3D1F08`,
          }}
        >
          <div 
            className="absolute top-4 left-0 right-0 h-3"
            style={{ background: accentColor, opacity: 0.8 }}
          />
          <div 
            className="absolute bottom-8 left-0 right-0 h-3"
            style={{ background: accentColor, opacity: 0.8 }}
          />

          <div 
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-12 rounded-md"
            style={{ 
              background: accentColor,
              boxShadow: `0 2px 8px rgba(0,0,0,0.3)`
            }}
          >
            <div 
              className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full"
              style={{ background: "#1a1a2e" }}
            />
          </div>

          <div 
            className="absolute -top-1 left-0 right-0 h-20 origin-bottom rounded-t-xl transition-transform duration-500"
            style={{
              background: `linear-gradient(180deg, #A0522D 0%, #8B4513 100%)`,
              border: `4px solid #3D1F08`,
              borderBottom: "none",
              transform: `perspective(500px) rotateX(${getLidRotation()})`,
              transformOrigin: "bottom center",
            }}
          >
            <div 
              className="absolute bottom-4 left-0 right-0 h-3"
              style={{ background: accentColor, opacity: 0.8 }}
            />
          </div>

          {(phase === "opening" || phase === "revealed") && (
            <div 
              className="absolute inset-4 rounded"
              style={{
                background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)`,
                animation: "pulse 1s ease-in-out infinite",
              }}
            />
          )}
        </div>

        {phase === "revealed" && winner && (
          <div 
            className="absolute -top-20 left-1/2 -translate-x-1/2 animate-float-up"
            style={{
              color: accentColor,
              textShadow: `0 0 20px ${accentColor}, 0 0 40px ${accentColor}`,
            }}
          >
            <div 
              className="text-4xl md:text-5xl font-bold whitespace-nowrap px-6 py-3 rounded-lg"
              style={{
                background: "rgba(26, 26, 46, 0.95)",
                border: `3px solid ${accentColor}`,
              }}
            >
              {winner.name}
            </div>
          </div>
        )}
      </div>

      <div 
        className="text-xl font-bold"
        style={{ color: accentColor }}
      >
        {phase === "shaking" && "宝箱を開けています..."}
        {phase === "opening" && "パカッ！"}
        {phase === "revealed" && `${winner?.name} さん！`}
        {phase === "idle" && "抽選を開始してください"}
      </div>
    </div>
  );
}
