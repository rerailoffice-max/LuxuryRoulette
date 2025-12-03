import { useEffect, useRef, useState } from "react";

interface WheelRouletteProps {
  entries: { id: number; name: string }[];
  isSpinning: boolean;
  winnerIndex: number;
  onSpinComplete: () => void;
  spinDuration: number;
  accentColor: string;
}

const WHEEL_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
  "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
  "#BB8FCE", "#85C1E9", "#F8B500", "#00CED1"
];

export function WheelRoulette({
  entries,
  isSpinning,
  winnerIndex,
  onSpinComplete,
  spinDuration,
  accentColor,
}: WheelRouletteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<number | null>(null);

  const segmentAngle = (2 * Math.PI) / entries.length;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = size / 2 - 10;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(rotation);

    entries.forEach((entry, i) => {
      const startAngle = i * segmentAngle;
      const endAngle = (i + 1) * segmentAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#000";
      ctx.font = `bold ${Math.min(20, 200 / entries.length)}px sans-serif`;
      
      const text = entry.name.length > 6 ? entry.name.slice(0, 6) + "…" : entry.name;
      ctx.fillText(text, radius - 15, 0);
      ctx.restore();
    });

    ctx.restore();

    ctx.beginPath();
    ctx.arc(center, center, 30, 0, Math.PI * 2);
    ctx.fillStyle = accentColor;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();

  }, [entries, rotation, segmentAngle, accentColor]);

  useEffect(() => {
    if (!isSpinning) return;

    // Calculate target angle so the winner segment center aligns with the top pointer
    // Pointer is at top (12 o'clock = -π/2 in canvas coordinates)
    // Segment i center is at (i * segmentAngle + segmentAngle/2)
    // We need: rotation + segmentCenter = -π/2 (top position)
    // So: rotation = -π/2 - segmentCenter
    const segmentCenter = winnerIndex * segmentAngle + segmentAngle / 2;
    const targetAngle = -Math.PI / 2 - segmentCenter;
    
    // Add multiple full rotations for dramatic effect, then land on target
    const extraRotations = Math.PI * 2 * (8 + Math.random() * 4);
    const totalRotation = targetAngle - extraRotations; // Subtract because we spin backwards (clockwise)
    
    const startTime = Date.now();
    const duration = spinDuration * 1000;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      
      setRotation(totalRotation * easedProgress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Ensure final rotation is exactly at target
        setRotation(totalRotation);
        onSpinComplete();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpinning, winnerIndex, segmentAngle, spinDuration, onSpinComplete]);

  return (
    <div className="relative flex items-center justify-center">
      <div 
        className="absolute -top-2 z-10"
        style={{
          width: 0,
          height: 0,
          borderLeft: "20px solid transparent",
          borderRight: "20px solid transparent",
          borderTop: `40px solid ${accentColor}`,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
        }}
      />
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="max-w-full"
        style={{ maxHeight: "60vh" }}
        data-testid="canvas-wheel-roulette"
      />
    </div>
  );
}
