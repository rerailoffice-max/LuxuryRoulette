import { useEffect, useState, useRef } from "react";

interface GachaCapsuleProps {
  entries: { id: number; name: string }[];
  isSpinning: boolean;
  winnerIndex: number;
  onSpinComplete: () => void;
  spinDuration: number;
  accentColor: string;
}

const CAPSULE_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
  "#FFEAA7", "#DDA0DD", "#F8B500", "#00CED1"
];

export function GachaCapsule({
  entries,
  isSpinning,
  winnerIndex,
  onSpinComplete,
  spinDuration,
  accentColor,
}: GachaCapsuleProps) {
  const [phase, setPhase] = useState<"idle" | "spinning" | "dropping" | "opening" | "revealed">("idle");
  const [capsuleRotation, setCapsuleRotation] = useState(0);
  const [capsuleY, setCapsuleY] = useState(-100);
  const [isOpen, setIsOpen] = useState(false);
  const animationRef = useRef<number | null>(null);
  const winner = entries[winnerIndex];
  const capsuleColor = CAPSULE_COLORS[winnerIndex % CAPSULE_COLORS.length];

  useEffect(() => {
    if (!isSpinning) return;

    setPhase("spinning");
    setIsOpen(false);
    setCapsuleY(-100);

    let rotation = 0;
    const spinDurationMs = spinDuration * 600;
    const startTime = Date.now();

    const animateSpin = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / spinDurationMs, 1);
      
      rotation += 20 * (1 - progress * 0.5);
      setCapsuleRotation(rotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateSpin);
      } else {
        setPhase("dropping");
      }
    };

    animationRef.current = requestAnimationFrame(animateSpin);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpinning, spinDuration]);

  useEffect(() => {
    if (phase !== "dropping") return;

    let y = -100;
    let velocity = 0;
    const gravity = 0.8;
    const bounce = 0.6;
    const ground = 150;
    let bounceCount = 0;

    const animateDrop = () => {
      velocity += gravity;
      y += velocity;

      if (y >= ground) {
        y = ground;
        velocity = -velocity * bounce;
        bounceCount++;
        
        if (bounceCount >= 3 || Math.abs(velocity) < 2) {
          setCapsuleY(ground);
          setPhase("opening");
          return;
        }
      }

      setCapsuleY(y);
      animationRef.current = requestAnimationFrame(animateDrop);
    };

    animationRef.current = requestAnimationFrame(animateDrop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "opening") return;

    setTimeout(() => {
      setIsOpen(true);
      setPhase("revealed");
      setTimeout(onSpinComplete, 500);
    }, 500);
  }, [phase, onSpinComplete]);

  useEffect(() => {
    if (!isSpinning) {
      setPhase("idle");
    }
  }, [isSpinning]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="relative w-64 h-80 rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #ff4757 0%, #c0392b 100%)",
          boxShadow: `0 10px 40px rgba(0,0,0,0.4), inset 0 0 30px rgba(0,0,0,0.3)`,
          border: `4px solid ${accentColor}`,
        }}
        data-testid="gacha-machine"
      >
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-40 rounded-full"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)",
            border: "4px solid rgba(255,255,255,0.3)",
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {phase === "spinning" && (
              <div className="flex flex-wrap gap-2 p-4 justify-center">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full animate-bounce"
                    style={{
                      background: CAPSULE_COLORS[i % CAPSULE_COLORS.length],
                      animationDelay: `${i * 100}ms`,
                      boxShadow: "inset 0 -4px 0 rgba(0,0,0,0.2)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0 w-20 h-24"
          style={{
            background: "linear-gradient(180deg, #555 0%, #333 100%)",
            borderRadius: "0 0 20px 20px",
          }}
        >
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-16 rounded-b-xl"
            style={{ background: "#222" }}
          />
        </div>

        <div
          className="absolute left-1/2 -translate-x-1/2 transition-all duration-300"
          style={{
            top: `${capsuleY}px`,
            transform: `translateX(-50%) rotate(${capsuleRotation}deg)`,
          }}
        >
          <div className="relative">
            <div
              className="w-16 h-8 rounded-t-full transition-all duration-500"
              style={{
                background: `linear-gradient(180deg, ${capsuleColor} 0%, ${capsuleColor}cc 100%)`,
                transform: isOpen ? "translateY(-20px) rotateX(60deg)" : "translateY(0)",
                boxShadow: "inset 0 4px 0 rgba(255,255,255,0.3)",
              }}
            />
            <div
              className="w-16 h-8 rounded-b-full"
              style={{
                background: "linear-gradient(180deg, #fff 0%, #ddd 100%)",
                boxShadow: "inset 0 -4px 0 rgba(0,0,0,0.1)",
              }}
            />
            
            {isOpen && (
              <div
                className="absolute -top-4 left-1/2 -translate-x-1/2 px-2 py-1 rounded whitespace-nowrap animate-bounce"
                style={{
                  background: accentColor,
                  color: "#000",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {winner?.name}
              </div>
            )}
          </div>
        </div>
      </div>

      {phase === "spinning" && (
        <p className="text-white/80 text-lg animate-pulse">ガラガラ...</p>
      )}
    </div>
  );
}
