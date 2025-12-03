import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { WinnerHistory, type WinnerRecord } from "@/components/winner-history";
import { RouletteSettingsPanel, DEFAULT_ROULETTE_SETTINGS, type RouletteSettings } from "@/components/roulette-settings";
import { VisualThemeSelector, THEME_CONFIGS, type VisualTheme } from "@/components/visual-theme-selector";
import { SoundSettingsPanel, DEFAULT_SOUND_SETTINGS, type SoundSettings } from "@/components/sound-settings";
import { 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Users, 
  ChevronDown, 
  ChevronUp,
  Trophy,
  Sparkles,
  UserMinus
} from "lucide-react";
import confetti from "canvas-confetti";

type AppState = "setup" | "spinning" | "winner";

export default function Home() {
  const [allNames, setAllNames] = useState<string[]>([]);
  const [remainingNames, setRemainingNames] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");
  const [appState, setAppState] = useState<AppState>("setup");
  const [currentName, setCurrentName] = useState("");
  const [winner, setWinner] = useState("");
  const [winnerRecords, setWinnerRecords] = useState<WinnerRecord[]>([]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isInputCollapsed, setIsInputCollapsed] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteSettings, setRouletteSettings] = useState<RouletteSettings>(DEFAULT_ROULETTE_SETTINGS);
  const [visualTheme, setVisualTheme] = useState<VisualTheme>("default");
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(DEFAULT_SOUND_SETTINGS);

  const themeConfig = useMemo(() => THEME_CONFIGS[visualTheme], [visualTheme]);
  
  const drumRollRef = useRef<HTMLAudioElement | null>(null);
  const fanfareRef = useRef<HTMLAudioElement | null>(null);
  const spinIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (spinIntervalRef.current) {
        clearTimeout(spinIntervalRef.current);
        spinIntervalRef.current = null;
      }
      if (drumRollRef.current) {
        drumRollRef.current.pause();
        drumRollRef.current.currentTime = 0;
      }
      if (fanfareRef.current) {
        fanfareRef.current.pause();
        fanfareRef.current.currentTime = 0;
      }
    };
  }, []);

  const initializeAudio = useCallback(() => {
    try {
      drumRollRef.current = new Audio(soundSettings.drumRollUrl);
      fanfareRef.current = new Audio(soundSettings.fanfareUrl);
      drumRollRef.current.loop = true;
      drumRollRef.current.volume = 0.7;
      fanfareRef.current.volume = 0.8;
      setAudioInitialized(true);
    } catch (e) {
      console.warn("Audio initialization failed:", e);
    }
  }, [soundSettings.drumRollUrl, soundSettings.fanfareUrl]);

  useEffect(() => {
    if (audioInitialized) {
      if (drumRollRef.current) {
        drumRollRef.current.pause();
        drumRollRef.current = null;
      }
      if (fanfareRef.current) {
        fanfareRef.current.pause();
        fanfareRef.current = null;
      }
      initializeAudio();
    }
  }, [soundSettings.drumRollUrl, soundSettings.fanfareUrl]);

  const parseNames = useCallback((text: string) => {
    const parsed = text
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
    setAllNames(parsed);
    setRemainingNames(parsed);
    setWinnerRecords([]);
    setRoundNumber(1);
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
      if (!isMountedRef.current) {
        clearInterval(interval);
        return;
      }
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
        colors: themeConfig.confettiColors,
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: themeConfig.confettiColors,
      });
    }, 250);

    return () => clearInterval(interval);
  }, [themeConfig.confettiColors]);

  const startRoulette = useCallback(() => {
    if (remainingNames.length < 1 || isSpinning) return;
    
    initializeAudio();
    setIsSpinning(true);
    setAppState("spinning");
    setIsInputCollapsed(true);
    playSound(drumRollRef.current);

    const namesToUse = remainingNames.length > 1 ? remainingNames : allNames;
    let currentIndex = 0;
    let speed = rouletteSettings.spinSpeed;
    let iterations = 0;
    const baseIterations = Math.floor(rouletteSettings.spinDuration * 10);
    const totalIterations = baseIterations + Math.floor(Math.random() * 10);
    const winnerIndex = Math.floor(Math.random() * namesToUse.length);
    const selectedWinner = namesToUse[winnerIndex];

    const spin = () => {
      if (!isMountedRef.current) {
        stopSound(drumRollRef.current);
        setIsSpinning(false);
        return;
      }

      setCurrentName(namesToUse[currentIndex]);
      currentIndex = (currentIndex + 1) % namesToUse.length;
      iterations++;

      const slowdownPhase1 = totalIterations - 10;
      const slowdownPhase2 = totalIterations - 5;
      
      if (iterations >= slowdownPhase1 && iterations < slowdownPhase2) {
        speed += 30;
      } else if (iterations >= slowdownPhase2) {
        speed += 80;
      }

      if (iterations >= totalIterations) {
        if (spinIntervalRef.current) {
          clearTimeout(spinIntervalRef.current);
          spinIntervalRef.current = null;
        }
        stopSound(drumRollRef.current);
        
        if (isMountedRef.current) {
          setCurrentName(selectedWinner);
          setWinner(selectedWinner);
          setWinnerRecords((prev) => [...prev, {
            name: selectedWinner,
            timestamp: new Date(),
            round: prev.length + 1
          }]);
          setRoundNumber((prev) => prev + 1);
          setRemainingNames((prev) => prev.filter((name) => name !== selectedWinner));
          setAppState("winner");
          setIsSpinning(false);
          playSound(fanfareRef.current);
          fireConfetti();
        }
      } else {
        spinIntervalRef.current = setTimeout(spin, speed);
      }
    };

    spin();
  }, [remainingNames, allNames, isSpinning, rouletteSettings, initializeAudio, playSound, stopSound, fireConfetti]);

  const resetToSetup = useCallback(() => {
    if (spinIntervalRef.current) {
      clearTimeout(spinIntervalRef.current);
      spinIntervalRef.current = null;
    }
    setAppState("setup");
    setWinner("");
    setCurrentName("");
    setIsInputCollapsed(false);
    setIsSpinning(false);
    setRemainingNames(allNames);
    setWinnerRecords([]);
    setRoundNumber(1);
    stopSound(drumRollRef.current);
    stopSound(fanfareRef.current);
  }, [allNames, stopSound]);

  const drawAgain = useCallback(() => {
    if (remainingNames.length < 1) {
      setRemainingNames(allNames);
    }
    setWinner("");
    setCurrentName("");
    setTimeout(() => startRoulette(), 100);
  }, [remainingNames.length, allNames, startRoulette]);

  const clearInput = useCallback(() => {
    setInputText("");
    setAllNames([]);
    setRemainingNames([]);
    setWinnerRecords([]);
    setRoundNumber(1);
  }, []);

  const clearWinnerHistory = useCallback(() => {
    setWinnerRecords([]);
    setRoundNumber(1);
    setRemainingNames(allNames);
  }, [allNames]);

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

      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <ThemeToggle />
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsMuted(!isMuted)}
          data-testid="button-mute-toggle"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="text-center py-8 md:py-12">
          <h1 
            className="font-display text-4xl md:text-6xl font-bold tracking-wider"
            style={{ 
              color: themeConfig.primaryColor,
              textShadow: `0 0 30px ${themeConfig.glowColor}` 
            }}
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
                <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-lg font-medium" data-testid="text-participant-count">
                      {allNames.length > 0 ? `${allNames.length} participants` : "Enter participants"}
                    </span>
                  </div>
                  {inputText && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearInput}
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
                  disabled={allNames.length < 2}
                  onClick={startRoulette}
                  className="px-16 py-6 text-2xl font-display font-bold tracking-wider disabled:opacity-50"
                  style={{
                    backgroundColor: themeConfig.primaryColor,
                    boxShadow: allNames.length >= 2 
                      ? `0 0 20px ${themeConfig.glowColor}, 0 0 40px ${themeConfig.glowColor}` 
                      : undefined,
                    animation: allNames.length >= 2 ? "pulse-glow 2s ease-in-out infinite" : undefined
                  }}
                  data-testid="button-start"
                >
                  <Sparkles className="w-6 h-6 mr-3" />
                  START
                  <Sparkles className="w-6 h-6 ml-3" />
                </Button>
              </div>

              {allNames.length > 0 && allNames.length < 2 && (
                <p className="text-center text-destructive text-sm" data-testid="text-error-min-participants">
                  Please enter at least 2 participants to start the draw
                </p>
              )}

              <VisualThemeSelector
                currentTheme={visualTheme}
                onThemeChange={setVisualTheme}
              />

              <RouletteSettingsPanel
                settings={rouletteSettings}
                onSettingsChange={setRouletteSettings}
              />

              <SoundSettingsPanel
                settings={soundSettings}
                onSettingsChange={setSoundSettings}
              />

              <WinnerHistory 
                winners={winnerRecords} 
                onClear={clearWinnerHistory}
              />
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
                className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-center px-4 py-8"
                style={{ 
                  color: themeConfig.primaryColor,
                  textShadow: `0 0 40px ${themeConfig.glowColor}, 0 0 80px ${themeConfig.glowColor.replace('0.6', '0.3')}`,
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
                <span data-testid="text-remaining-count">{remainingNames.length} remaining</span>
              </div>
            </div>
          )}

          {appState === "winner" && (
            <div className="flex flex-col items-center justify-center flex-1 w-full animate-winner-entrance">
              <div className="text-center">
                <div className="animate-float mb-6">
                  <Trophy 
                    className="w-20 h-20 md:w-24 md:h-24 mx-auto"
                    style={{ 
                      color: themeConfig.primaryColor,
                      filter: `drop-shadow(0 0 20px ${themeConfig.glowColor})` 
                    }}
                  />
                </div>
                
                <div className="mb-4">
                  <span 
                    className="text-2xl md:text-3xl font-display tracking-widest uppercase"
                    style={{ 
                      color: themeConfig.primaryColor,
                      opacity: 0.8,
                      textShadow: `0 0 20px ${themeConfig.glowColor.replace('0.6', '0.4')}` 
                    }}
                  >
                    Winner
                  </span>
                </div>
                
                <div 
                  className="text-6xl md:text-8xl lg:text-9xl font-display font-bold px-4 py-4 uppercase tracking-wide"
                  style={{ 
                    color: themeConfig.primaryColor,
                    textShadow: `0 0 60px ${themeConfig.glowColor.replace('0.6', '0.8')}, 0 0 120px ${themeConfig.glowColor.replace('0.6', '0.4')}`,
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

                {remainingNames.length > 0 && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <UserMinus className="w-4 h-4" />
                    <span data-testid="text-remaining-after-win">{remainingNames.length} participants remaining</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-12">
                <Button
                  size="lg"
                  onClick={drawAgain}
                  disabled={isSpinning}
                  className="px-8 py-4 text-lg font-display font-bold tracking-wider"
                  style={{
                    backgroundColor: themeConfig.primaryColor
                  }}
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

              {winnerRecords.length > 1 && (
                <div className="mt-8 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Previous winners:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {winnerRecords.slice(0, -1).map((record, i) => (
                      <span 
                        key={`${record.name}-${record.round}`}
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${themeConfig.primaryColor}33`,
                          color: themeConfig.primaryColor
                        }}
                        data-testid={`text-previous-winner-${i}`}
                      >
                        {record.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
                  <span className="text-sm" data-testid="text-collapsed-count">
                    {allNames.length} total / {remainingNames.length} remaining
                  </span>
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
