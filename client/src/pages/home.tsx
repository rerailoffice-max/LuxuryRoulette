import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Users, 
  ChevronDown, 
  ChevronUp,
  Trophy,
  Sparkles
} from "lucide-react";
import confetti from "canvas-confetti";

type AppState = "setup" | "spinning" | "winner";

const DRUM_ROLL_URL = "https://www.soundjay.com/misc/sounds/drum-roll-01.mp3";
const FANFARE_URL = "https://www.soundjay.com/misc/sounds/fanfare-1.mp3";

export default function Home() {
  const [names, setNames] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");
  const [appState, setAppState] = useState<AppState>("setup");
  const [currentName, setCurrentName] = useState("");
  const [winner, setWinner] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  const drumRollRef = useRef<HTMLAudioElement | null>(null);
  const fanfareRef = useRef<HTMLAudioElement | null>(null);
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const initializeAudio = useCallback(() => {
    if (!audioInitialized) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      drumRollRef.current = new Audio(DRUM_ROLL_URL);
      fanfareRef.current = new Audio(FANFARE_URL);
      drumRollRef.current.loop = true;
      setAudioInitialized(true);
    }
  }, [audioInitialized]);

  const parseNames = useCallback((text: string) => {
    const parsed = text
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
    setNames(parsed);
    return parsed;
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    parseNames(text);
  }, [parseNames]);

  const playSound = useCallback((audio: HTMLAudioElement | null) => {
    if (audio && !isMuted) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }, [isMuted]);

  const stopSound = useCallback((audio: HTMLAudioElement | null) => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const fireConfetti = useCallback(() => {
    const duration = 4000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#FFD700", "#FFA500", "#FF6347", "#00FF00", "#00CED1", "#FF1493"],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#FFD700", "#FFA500", "#FF6347", "#00FF00", "#00CED1", "#FF1493"],
      });
    }, 250);
  }, []);

  const startRoulette = useCallback(() => {
    if (names.length < 2) return;
    
    initializeAudio();
    setAppState("spinning");
    setIsInputCollapsed(true);
    playSound(drumRollRef.current);

    let currentIndex = 0;
    let speed = 50;
    let iterations = 0;
    const totalIterations = 40 + Math.floor(Math.random() * 20);
    const winnerIndex = Math.floor(Math.random() * names.length);

    const spin = () => {
      setCurrentName(names[currentIndex]);
      currentIndex = (currentIndex + 1) % names.length;
      iterations++;

      if (iterations >= totalIterations - 10) {
        speed += 50;
      }
      if (iterations >= totalIterations - 5) {
        speed += 100;
      }

      if (iterations >= totalIterations) {
        if (spinIntervalRef.current) {
          clearTimeout(spinIntervalRef.current);
        }
        stopSound(drumRollRef.current);
        setCurrentName(names[winnerIndex]);
        setWinner(names[winnerIndex]);
        setAppState("winner");
        playSound(fanfareRef.current);
        fireConfetti();
      } else {
        spinIntervalRef.current = setTimeout(spin, speed);
      }
    };

    spin();
  }, [names, initializeAudio, playSound, stopSound, fireConfetti]);

  const resetToSetup = useCallback(() => {
    setAppState("setup");
    setWinner("");
    setCurrentName("");
    setIsInputCollapsed(false);
    stopSound(drumRollRef.current);
    stopSound(fanfareRef.current);
  }, [stopSound]);

  const drawAgain = useCallback(() => {
    setWinner("");
    setCurrentName("");
    startRoulette();
  }, [startRoulette]);

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) {
        clearTimeout(spinIntervalRef.current);
      }
      stopSound(drumRollRef.current);
      stopSound(fanfareRef.current);
    };
  }, [stopSound]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, hsl(var(--background)) 0%, hsl(0 0% 4%) 100%)",
        }}
      />
      
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary)) 1px, transparent 1px),
                              radial-gradient(circle at 75% 75%, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <Button
        size="icon"
        variant="ghost"
        className="fixed top-4 right-4 z-50"
        onClick={() => setIsMuted(!isMuted)}
        data-testid="button-mute-toggle"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </Button>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="text-center py-8 md:py-12">
          <h1 
            className="font-display text-4xl md:text-6xl font-bold tracking-wider text-primary"
            style={{ textShadow: "0 0 30px rgba(245, 158, 11, 0.5)" }}
          >
            LUCKY DRAW
          </h1>
          <p className="text-muted-foreground mt-2 text-lg tracking-wide">
            Glamorous Lottery Roulette
          </p>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
          {appState === "setup" && (
            <div className="w-full max-w-2xl space-y-8">
              <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-sm border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-lg font-medium">
                      {names.length > 0 ? `${names.length} participants` : "Enter participants"}
                    </span>
                  </div>
                  {inputText && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setInputText("");
                        setNames([]);
                      }}
                      data-testid="button-clear-names"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
                
                <Textarea
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder="Paste participant names here (one name per line)&#10;&#10;Example:&#10;Taro Yamada&#10;Hanako Sato&#10;Ichiro Tanaka"
                  className="min-h-64 md:min-h-80 text-base resize-none bg-background/50 border-muted focus:border-primary transition-colors"
                  data-testid="input-names"
                />
              </Card>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  disabled={names.length < 2}
                  onClick={startRoulette}
                  className="px-16 py-6 text-2xl font-display font-bold tracking-wider animate-pulse-glow disabled:animate-none disabled:opacity-50"
                  data-testid="button-start"
                >
                  <Sparkles className="w-6 h-6 mr-3" />
                  START
                  <Sparkles className="w-6 h-6 ml-3" />
                </Button>
              </div>

              {names.length > 0 && names.length < 2 && (
                <p className="text-center text-destructive text-sm">
                  Please enter at least 2 participants to start the draw
                </p>
              )}
            </div>
          )}

          {appState === "spinning" && (
            <div className="flex flex-col items-center justify-center flex-1 w-full">
              <div className="text-center mb-8">
                <span className="text-muted-foreground text-xl tracking-widest uppercase">
                  Drawing
                  <span className="inline-block animate-pulse">...</span>
                </span>
              </div>
              
              <div 
                className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-primary text-center px-4 py-8"
                style={{ 
                  textShadow: "0 0 40px rgba(245, 158, 11, 0.6), 0 0 80px rgba(245, 158, 11, 0.3)",
                  minHeight: "200px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                data-testid="text-spinning-name"
              >
                {currentName}
              </div>

              <div className="mt-12 flex items-center gap-2 text-muted-foreground">
                <Users className="w-5 h-5" />
                <span>{names.length} participants</span>
              </div>
            </div>
          )}

          {appState === "winner" && (
            <div className="flex flex-col items-center justify-center flex-1 w-full animate-winner-entrance">
              <div className="text-center">
                <div className="animate-float mb-6">
                  <Trophy 
                    className="w-20 h-20 md:w-24 md:h-24 text-primary mx-auto"
                    style={{ filter: "drop-shadow(0 0 20px rgba(245, 158, 11, 0.6))" }}
                  />
                </div>
                
                <div className="mb-4">
                  <span 
                    className="text-2xl md:text-3xl font-display tracking-widest text-primary/80 uppercase"
                    style={{ textShadow: "0 0 20px rgba(245, 158, 11, 0.4)" }}
                  >
                    Winner
                  </span>
                </div>
                
                <div 
                  className="text-6xl md:text-8xl lg:text-9xl font-display font-bold text-primary px-4 py-4 uppercase tracking-wide"
                  style={{ 
                    textShadow: "0 0 60px rgba(245, 158, 11, 0.8), 0 0 120px rgba(245, 158, 11, 0.4)",
                  }}
                  data-testid="text-winner-name"
                >
                  {winner}
                </div>
                
                <div 
                  className="mt-6 text-xl md:text-2xl text-muted-foreground font-medium tracking-wide"
                >
                  Congratulations!
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-12">
                <Button
                  size="lg"
                  onClick={drawAgain}
                  className="px-8 py-4 text-lg font-display font-bold tracking-wider"
                  data-testid="button-draw-again"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Draw Again
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={resetToSetup}
                  className="px-8 py-4 text-lg font-display tracking-wider"
                  data-testid="button-back-to-setup"
                >
                  Back to Setup
                </Button>
              </div>
            </div>
          )}
        </main>

        {(appState === "spinning" || appState === "winner") && (
          <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border">
            <div className="max-w-4xl mx-auto p-4">
              <button
                onClick={() => setIsInputCollapsed(!isInputCollapsed)}
                className="flex items-center justify-between w-full text-left gap-2"
                data-testid="button-toggle-input"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{names.length} participants</span>
                </div>
                {isInputCollapsed ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              {!isInputCollapsed && (
                <div className="mt-4">
                  <Textarea
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Paste participant names here (one name per line)"
                    className="min-h-32 text-sm resize-none bg-background/50 border-muted"
                    data-testid="input-names-collapsed"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
