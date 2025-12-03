import { useEffect, useState } from "react";

interface CardFlipProps {
  entries: { id: number; name: string }[];
  isSpinning: boolean;
  winnerIndex: number;
  onSpinComplete: () => void;
  spinDuration: number;
  accentColor: string;
}

export function CardFlip({
  entries,
  isSpinning,
  winnerIndex,
  onSpinComplete,
  spinDuration,
  accentColor,
}: CardFlipProps) {
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "shuffling" | "selecting" | "revealing">("idle");

  const displayCount = Math.min(entries.length, 6);

  useEffect(() => {
    if (isSpinning && phase === "idle") {
      setPhase("shuffling");
      setIsShuffling(true);
      setRevealedCards(new Set());
      setSelectedCard(null);

      const indices = Array.from({ length: displayCount }, (_, i) => i);
      
      let shuffleCount = 0;
      const maxShuffles = 10;
      const shuffleInterval = setInterval(() => {
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        setShuffledIndices([...indices]);
        shuffleCount++;

        if (shuffleCount >= maxShuffles) {
          clearInterval(shuffleInterval);
          setIsShuffling(false);
          setPhase("selecting");
          
          setTimeout(() => {
            const winnerCardPosition = Math.floor(Math.random() * displayCount);
            setSelectedCard(winnerCardPosition);
            setPhase("revealing");
            
            setTimeout(() => {
              setRevealedCards(new Set([winnerCardPosition]));
              setTimeout(() => {
                onSpinComplete();
                setPhase("idle");
              }, 800);
            }, 500);
          }, spinDuration * 300);
        }
      }, 150);

      return () => clearInterval(shuffleInterval);
    }
  }, [isSpinning, phase, displayCount, spinDuration, onSpinComplete]);

  useEffect(() => {
    if (!isSpinning) {
      setPhase("idle");
    }
  }, [isSpinning]);

  const winner = entries[winnerIndex];

  return (
    <div className="flex flex-col items-center gap-6">
      <div 
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${Math.min(displayCount, 3)}, 1fr)`,
        }}
      >
        {Array.from({ length: displayCount }).map((_, i) => {
          const isRevealed = revealedCards.has(i);
          const isSelected = selectedCard === i;
          
          return (
            <div
              key={i}
              className={`relative w-24 h-32 md:w-32 md:h-44 transition-all duration-500 ${
                isShuffling ? "animate-pulse" : ""
              } ${isSelected ? "scale-110 z-10" : ""}`}
              style={{
                perspective: "1000px",
                transform: isShuffling 
                  ? `translateX(${(shuffledIndices[i] || 0) * 5 - 10}px) rotate(${Math.sin(Date.now() / 100 + i) * 5}deg)`
                  : undefined,
              }}
              data-testid={`card-${i}`}
            >
              <div
                className="w-full h-full transition-transform duration-700"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isRevealed ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-xl flex items-center justify-center"
                  style={{
                    backfaceVisibility: "hidden",
                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`,
                    border: `3px solid ${accentColor}`,
                    boxShadow: isSelected ? `0 0 20px ${accentColor}` : "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                >
                  <span className="text-4xl md:text-5xl">?</span>
                </div>
                <div
                  className="absolute inset-0 rounded-xl flex items-center justify-center bg-white"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    border: `3px solid ${accentColor}`,
                    boxShadow: `0 0 30px ${accentColor}`,
                  }}
                >
                  <span 
                    className="text-lg md:text-xl font-bold text-center px-2"
                    style={{ color: "#1a1a2e" }}
                  >
                    {winner?.name}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {phase === "selecting" && (
        <p className="text-white/80 text-lg animate-pulse">
          カードを選んでいます...
        </p>
      )}
    </div>
  );
}
