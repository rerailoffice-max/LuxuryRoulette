import { useEffect, useState, useRef } from "react";

interface SlotMachineProps {
  entries: { id: number; name: string }[];
  isSpinning: boolean;
  winnerIndex: number;
  onSpinComplete: () => void;
  spinDuration: number;
  accentColor: string;
}

export function SlotMachine({
  entries,
  isSpinning,
  winnerIndex,
  onSpinComplete,
  spinDuration,
  accentColor,
}: SlotMachineProps) {
  const [reelPositions, setReelPositions] = useState([0, 0, 0]);
  const [stoppedReels, setStoppedReels] = useState([false, false, false]);
  const [displayNames, setDisplayNames] = useState<string[][]>([[], [], []]);
  const animationRefs = useRef<(number | null)[]>([null, null, null]);

  const winner = entries[winnerIndex];

  useEffect(() => {
    const extendedEntries = [...entries, ...entries, ...entries];
    const reelNames = [
      extendedEntries.map(e => e.name),
      extendedEntries.map(e => e.name),
      extendedEntries.map(e => e.name),
    ];
    setDisplayNames(reelNames);
  }, [entries]);

  useEffect(() => {
    if (!isSpinning) return;

    setStoppedReels([false, false, false]);
    
    const speeds = [15, 18, 21];
    const stopDelays = [
      spinDuration * 400,
      spinDuration * 600,
      spinDuration * 900,
    ];

    const spinReel = (reelIndex: number) => {
      let position = 0;
      let speed = speeds[reelIndex];
      let stopped = false;
      const itemHeight = 80;
      const totalHeight = entries.length * 3 * itemHeight;
      
      // The center window shows the item at position/itemHeight + 1
      // So to show winnerIndex in center: position/80 + 1 = entries.length + winnerIndex
      // Therefore: position = (entries.length + winnerIndex - 1) * 80
      const targetPosition = (entries.length + winnerIndex - 1) * itemHeight;

      const animate = () => {
        if (stopped) return;
        
        position += speed;
        if (position >= totalHeight) {
          position = position % totalHeight;
        }

        setReelPositions(prev => {
          const newPositions = [...prev];
          newPositions[reelIndex] = position;
          return newPositions;
        });

        animationRefs.current[reelIndex] = requestAnimationFrame(animate);
      };

      animate();

      setTimeout(() => {
        stopped = true;
        if (animationRefs.current[reelIndex]) {
          cancelAnimationFrame(animationRefs.current[reelIndex]!);
        }

        let currentPos = position;
        const decelerateInterval = setInterval(() => {
          speed *= 0.9;
          currentPos += speed;
          
          if (currentPos >= totalHeight) {
            currentPos = currentPos % totalHeight;
          }

          setReelPositions(prev => {
            const newPositions = [...prev];
            newPositions[reelIndex] = currentPos;
            return newPositions;
          });

          if (speed < 1) {
            clearInterval(decelerateInterval);
            setReelPositions(prev => {
              const newPositions = [...prev];
              newPositions[reelIndex] = targetPosition;
              return newPositions;
            });
            
            setStoppedReels(prev => {
              const newStopped = [...prev];
              newStopped[reelIndex] = true;
              return newStopped;
            });
          }
        }, 30);
      }, stopDelays[reelIndex]);
    };

    [0, 1, 2].forEach(spinReel);

    return () => {
      animationRefs.current.forEach(ref => {
        if (ref) cancelAnimationFrame(ref);
      });
    };
  }, [isSpinning, winnerIndex, entries.length, spinDuration]);

  useEffect(() => {
    if (stoppedReels.every(s => s) && isSpinning) {
      setTimeout(onSpinComplete, 300);
    }
  }, [stoppedReels, isSpinning, onSpinComplete]);

  const itemHeight = 80;

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className="relative rounded-2xl p-4 md:p-6"
        style={{
          background: "linear-gradient(180deg, #2a2a4a 0%, #1a1a2e 100%)",
          border: `4px solid ${accentColor}`,
          boxShadow: `0 0 30px ${accentColor}40, inset 0 0 60px rgba(0,0,0,0.5)`,
        }}
      >
        <div className="flex gap-2 md:gap-4">
          {[0, 1, 2].map((reelIndex) => (
            <div
              key={reelIndex}
              className="relative overflow-hidden rounded-lg"
              style={{
                width: "100px",
                height: `${itemHeight * 3}px`,
                background: "linear-gradient(180deg, #fff 0%, #f0f0f0 100%)",
                boxShadow: "inset 0 0 20px rgba(0,0,0,0.2)",
              }}
              data-testid={`slot-reel-${reelIndex}`}
            >
              <div
                className="absolute w-full transition-transform"
                style={{
                  transform: `translateY(-${reelPositions[reelIndex]}px)`,
                  transition: stoppedReels[reelIndex] ? "transform 0.3s ease-out" : "none",
                }}
              >
                {displayNames[reelIndex].map((name, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center font-bold text-gray-800"
                    style={{
                      height: `${itemHeight}px`,
                      fontSize: name.length > 4 ? "14px" : "18px",
                    }}
                  >
                    {name.length > 5 ? name.slice(0, 5) + "…" : name}
                  </div>
                ))}
              </div>

              <div
                className="absolute inset-x-0 pointer-events-none"
                style={{
                  top: `${itemHeight}px`,
                  height: `${itemHeight}px`,
                  background: `linear-gradient(90deg, ${accentColor}20 0%, ${accentColor}40 50%, ${accentColor}20 100%)`,
                  borderTop: `2px solid ${accentColor}`,
                  borderBottom: `2px solid ${accentColor}`,
                }}
              />
            </div>
          ))}
        </div>

        <div 
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-16 rounded-l-lg"
          style={{ background: accentColor }}
        />
        <div 
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-16 rounded-r-lg"
          style={{ background: accentColor }}
        />
      </div>

      {stoppedReels.every(s => s) && (
        <p className="text-xl font-bold" style={{ color: accentColor }}>
          {winner?.name}
        </p>
      )}
    </div>
  );
}
