import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { WinnerHistory, type WinnerRecord } from "@/components/winner-history";
import { RouletteSettingsPanel, DEFAULT_ROULETTE_SETTINGS, type RouletteSettings } from "@/components/roulette-settings";
import { VisualThemeSelector, THEME_CONFIGS, type VisualTheme } from "@/components/visual-theme-selector";
import { SoundSettingsPanel, DEFAULT_SOUND_SETTINGS, type SoundSettings } from "@/components/sound-settings";
import { useToast } from "@/hooks/use-toast";
import { 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Users, 
  ChevronDown, 
  ChevronUp,
  Trophy,
  Sparkles,
  UserMinus,
  AlertCircle
} from "lucide-react";
import confetti from "canvas-confetti";

type AppState = "setup" | "preview" | "spinning" | "winner";

const removeHonorifics = (name: string): string => {
  return name
    .replace(/さん$/g, "")
    .replace(/様$/g, "")
    .replace(/君$/g, "")
    .replace(/ちゃん$/g, "")
    .replace(/殿$/g, "")
    .replace(/氏$/g, "")
    .replace(/先生$/g, "")
    .trim();
};

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
  const [audioReady, setAudioReady] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteSettings, setRouletteSettings] = useState<RouletteSettings>(DEFAULT_ROULETTE_SETTINGS);
  const [visualTheme, setVisualTheme] = useState<VisualTheme>("default");
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(DEFAULT_SOUND_SETTINGS);

  const { toast } = useToast();
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

  const initializeAudio = useCallback(async () => {
    try {
      if (drumRollRef.current) {
        drumRollRef.current.pause();
        drumRollRef.current = null;
      }
      if (fanfareRef.current) {
        fanfareRef.current.pause();
        fanfareRef.current = null;
      }

      const drumRoll = new Audio(soundSettings.drumRollUrl);
      const fanfare = new Audio(soundSettings.fanfareUrl);
      
      drumRoll.loop = true;
      drumRoll.volume = 0.7;
      fanfare.volume = 0.8;
      
      drumRoll.preload = "auto";
      fanfare.preload = "auto";

      await Promise.all([
        new Promise<void>((resolve, reject) => {
          drumRoll.addEventListener("canplaythrough", () => resolve(), { once: true });
          drumRoll.addEventListener("error", () => reject(new Error("ドラムロール音声の読み込みに失敗しました")), { once: true });
          drumRoll.load();
        }),
        new Promise<void>((resolve, reject) => {
          fanfare.addEventListener("canplaythrough", () => resolve(), { once: true });
          fanfare.addEventListener("error", () => reject(new Error("ファンファーレ音声の読み込みに失敗しました")), { once: true });
          fanfare.load();
        })
      ]);

      drumRollRef.current = drumRoll;
      fanfareRef.current = fanfare;
      setAudioInitialized(true);
      setAudioReady(true);
    } catch (e) {
      console.warn("Audio initialization failed:", e);
      setAudioReady(false);
      toast({
        title: "音声の読み込みに失敗しました",
        description: "効果音なしで抽選を続行できます",
        variant: "destructive",
      });
    }
  }, [soundSettings.drumRollUrl, soundSettings.fanfareUrl, toast]);

  useEffect(() => {
    if (audioInitialized) {
      initializeAudio();
    }
  }, [soundSettings.drumRollUrl, soundSettings.fanfareUrl]);

  const parseNames = useCallback((text: string) => {
    const parsed = text
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .map(removeHonorifics)
      .filter((name) => name.length > 0);
    setAllNames(parsed);
    setRemainingNames(parsed);
    return parsed;
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    parseNames(text);
  }, [parseNames]);

  const playSound = useCallback((audio: HTMLAudioElement | null) => {
    if (audio && !isMuted && audioReady) {
      audio.currentTime = 0;
      audio.play().catch((e) => {
        console.warn("Audio playback failed:", e);
      });
    }
  }, [isMuted, audioReady]);

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
    if (allNames.length < 2 || isSpinning) return;
    
    initializeAudio();
    setIsSpinning(true);
    setAppState("spinning");
    setIsInputCollapsed(true);
    playSound(drumRollRef.current);

    const namesToUse = remainingNames.length > 1 ? remainingNames : allNames;
    if (namesToUse.length === 0) {
      setIsSpinning(false);
      setAppState("setup");
      return;
    }
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
    stopSound(drumRollRef.current);
    stopSound(fanfareRef.current);
  }, [stopSound]);

  const goToPreview = useCallback(async () => {
    if (allNames.length < 2) return;
    
    if (!audioInitialized) {
      await initializeAudio();
    }
    
    setAppState("preview");
    setIsInputCollapsed(true);
  }, [allNames.length, audioInitialized, initializeAudio]);

  const startFromPreview = useCallback(() => {
    startRoulette();
  }, [startRoulette]);

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
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, 
          hsl(45 100% 97%) 0%, 
          hsl(45 80% 95%) 25%, 
          hsl(40 70% 93%) 50%, 
          hsl(35 60% 95%) 75%,
          hsl(45 100% 97%) 100%)`
      }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, ${themeConfig.primaryColor}40 2px, transparent 2px),
                              radial-gradient(circle at 75% 75%, ${themeConfig.primaryColor}30 2px, transparent 2px)`,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <Button
          size="icon"
          variant="outline"
          onClick={() => setIsMuted(!isMuted)}
          data-testid="button-mute-toggle"
          aria-label={isMuted ? "音をオン" : "音をオフ"}
          className="bg-white/80 backdrop-blur-sm"
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
              textShadow: `2px 2px 4px rgba(0,0,0,0.1)` 
            }}
          >
            抽選ルーレット
          </h1>
          <p 
            className="mt-2 text-lg tracking-wide font-medium"
            style={{ color: "#555" }}
          >
            ワクワク抽選タイム！
          </p>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
          {appState === "setup" && (
            <div className="w-full max-w-2xl space-y-8">
              <Card className="p-6 md:p-8 bg-white/90 backdrop-blur-sm border-2" style={{ borderColor: `${themeConfig.primaryColor}30` }}>
                <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-lg font-medium" data-testid="text-participant-count">
                      {allNames.length > 0 ? `${allNames.length}名の参加者` : "参加者を入力してください"}
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
                      クリア
                    </Button>
                  )}
                </div>
                
                <Textarea
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder="参加者の名前を入力してください（1行に1名）&#10;&#10;例：&#10;山田太郎さん&#10;佐藤花子様&#10;田中一郎&#10;&#10;※敬称（さん・様など）は自動で削除されます"
                  className="min-h-64 md:min-h-80 text-base resize-none bg-background/50 border-muted focus:border-primary transition-colors"
                  data-testid="input-names"
                />
              </Card>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  disabled={allNames.length < 2}
                  onClick={goToPreview}
                  className="px-16 py-6 text-2xl font-display font-bold tracking-wider"
                  style={{
                    backgroundColor: allNames.length >= 2 ? themeConfig.primaryColor : undefined,
                    boxShadow: allNames.length >= 2 
                      ? `0 0 20px ${themeConfig.glowColor}, 0 0 40px ${themeConfig.glowColor}` 
                      : undefined,
                    animation: allNames.length >= 2 ? "pulse-glow 2s ease-in-out infinite" : undefined,
                    opacity: allNames.length < 2 ? 0.5 : 1,
                    cursor: allNames.length < 2 ? "not-allowed" : "pointer"
                  }}
                  data-testid="button-start"
                >
                  <Sparkles className="w-6 h-6 mr-3" />
                  確認へ進む
                  <Sparkles className="w-6 h-6 ml-3" />
                </Button>
              </div>

              {allNames.length > 0 && allNames.length < 2 && (
                <p className="text-center text-destructive text-sm" data-testid="text-error-min-participants">
                  抽選を開始するには2名以上の参加者が必要です
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

          {appState === "preview" && (
            <div className="flex flex-col items-center justify-center flex-1 w-full">
              <div className="text-center mb-6">
                <span 
                  className="text-2xl md:text-3xl font-display tracking-widest font-bold"
                  style={{ color: themeConfig.primaryColor }}
                >
                  今回の参加者
                </span>
                <p className="mt-2" style={{ color: "#555" }}>
                  この中から当選者が選ばれます！
                </p>
              </div>
              
              <div className="w-full max-w-4xl px-4">
                <Card className="p-4 mb-6 bg-white/80 backdrop-blur-sm border-2" style={{ borderColor: `${themeConfig.primaryColor}30` }}>
                  <div className="flex flex-wrap justify-center gap-3 max-h-64 overflow-y-auto">
                    {allNames.map((name, index) => (
                      <span 
                        key={`${name}-${index}`}
                        className="px-4 py-2 rounded-full text-base font-medium animate-bounce-in"
                        style={{
                          backgroundColor: `${themeConfig.primaryColor}20`,
                          color: themeConfig.primaryColor,
                          animationDelay: `${index * 50}ms`
                        }}
                        data-testid={`preview-name-${index}`}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </Card>
                
                <div className="text-center mb-6">
                  <span className="text-2xl font-display font-bold" style={{ color: themeConfig.primaryColor }}>
                    {allNames.length}名
                  </span>
                  <span className="text-lg ml-2" style={{ color: "#555" }}>がエントリー！</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={startFromPreview}
                  className="px-16 py-6 text-2xl font-display font-bold tracking-wider"
                  style={{
                    backgroundColor: themeConfig.primaryColor,
                    boxShadow: `0 0 20px ${themeConfig.glowColor}, 0 0 40px ${themeConfig.glowColor}`,
                    animation: "pulse-glow 2s ease-in-out infinite"
                  }}
                  data-testid="button-start-roulette"
                >
                  <Sparkles className="w-6 h-6 mr-3" />
                  抽選スタート！
                  <Sparkles className="w-6 h-6 ml-3" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={resetToSetup}
                  className="px-8 py-4 text-lg font-display tracking-wider"
                  data-testid="button-back-to-edit"
                >
                  戻って編集
                </Button>
              </div>
            </div>
          )}

          {appState === "spinning" && (
            <div className="flex flex-col items-center justify-center flex-1 w-full">
              <div className="text-center mb-4">
                <span 
                  className="text-xl tracking-widest font-medium"
                  style={{ color: "#666" }}
                >
                  抽選中
                  <span className="inline-block animate-pulse">...</span>
                </span>
              </div>
              
              <Card 
                className="px-12 py-8 mb-8 bg-white/95 backdrop-blur-sm border-2"
                style={{ borderColor: themeConfig.primaryColor }}
              >
                <div 
                  className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-center"
                  style={{ 
                    color: themeConfig.primaryColor,
                    textShadow: `2px 2px 4px rgba(0,0,0,0.1)`,
                    minHeight: "120px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  data-testid="text-spinning-name"
                >
                  {currentName}
                </div>
              </Card>

              <div className="w-full max-w-3xl px-4">
                <div className="text-center mb-3">
                  <span className="text-sm font-medium" style={{ color: "#666" }}>
                    抽選対象者（{remainingNames.length}名）
                  </span>
                </div>
                <div className="flex flex-wrap justify-center gap-2 p-4 bg-white/60 rounded-lg border" style={{ borderColor: `${themeConfig.primaryColor}20` }}>
                  {remainingNames.map((name, index) => (
                    <span 
                      key={`${name}-${index}`}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                        name === currentName ? "scale-110 ring-2 ring-current" : "opacity-60"
                      }`}
                      style={{
                        backgroundColor: name === currentName ? themeConfig.primaryColor : `${themeConfig.primaryColor}20`,
                        color: name === currentName ? "white" : themeConfig.primaryColor
                      }}
                      data-testid={`spinning-name-${index}`}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {appState === "winner" && (
            <div className="flex flex-col items-center justify-center flex-1 w-full animate-winner-entrance">
              <div className="text-center">
                <div className="animate-float mb-4">
                  <Trophy 
                    className="w-16 h-16 md:w-20 md:h-20 mx-auto"
                    style={{ 
                      color: themeConfig.primaryColor,
                      filter: `drop-shadow(2px 2px 4px rgba(0,0,0,0.2))` 
                    }}
                  />
                </div>
                
                <div className="mb-2">
                  <span 
                    className="text-xl md:text-2xl font-display tracking-widest font-bold"
                    style={{ color: themeConfig.primaryColor }}
                  >
                    当選者
                  </span>
                </div>
                
                <Card 
                  className="px-8 py-6 mb-4 bg-white/95 backdrop-blur-sm border-2"
                  style={{ borderColor: themeConfig.primaryColor }}
                >
                  <div 
                    className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-wide"
                    style={{ 
                      color: themeConfig.primaryColor,
                      textShadow: `2px 2px 4px rgba(0,0,0,0.1)`,
                    }}
                    data-testid="text-winner-name"
                  >
                    {winner}
                  </div>
                </Card>
                
                <div 
                  className="text-xl md:text-2xl font-medium tracking-wide"
                  style={{ color: "#555" }}
                >
                  おめでとうございます！
                </div>
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
                  もう一回抽選
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={resetToSetup}
                  className="px-8 py-4 text-lg font-display tracking-wider"
                  data-testid="button-back-to-setup"
                >
                  最初に戻る
                </Button>
              </div>

              {winnerRecords.length > 1 && (
                <div className="mt-6 text-center">
                  <p className="text-sm mb-2" style={{ color: "#666" }}>これまでの当選者：</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {winnerRecords.slice(0, -1).map((record, i) => (
                      <span 
                        key={`${record.name}-${record.round}`}
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${themeConfig.primaryColor}25`,
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

              {remainingNames.length > 0 && (
                <div className="mt-6 w-full max-w-3xl mx-auto px-4">
                  <div className="text-center mb-3">
                    <span className="text-sm font-medium" style={{ color: "#666" }}>
                      次回の抽選対象者（残り{remainingNames.length}名）
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 p-3 bg-white/60 rounded-lg border" style={{ borderColor: `${themeConfig.primaryColor}20` }}>
                    {remainingNames.map((name, index) => (
                      <span 
                        key={`${name}-${index}`}
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${themeConfig.primaryColor}20`,
                          color: themeConfig.primaryColor
                        }}
                        data-testid={`remaining-name-${index}`}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {(appState === "spinning" || appState === "winner") && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t-2" style={{ borderColor: `${themeConfig.primaryColor}30` }}>
            <div className="max-w-4xl mx-auto p-4">
              <button
                onClick={() => setIsInputCollapsed(!isInputCollapsed)}
                className="flex items-center justify-between w-full text-left gap-2"
                data-testid="button-toggle-input"
              >
                <div className="flex items-center gap-2" style={{ color: "#555" }}>
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium" data-testid="text-collapsed-count">
                    全{allNames.length}名 / 残り{remainingNames.length}名
                  </span>
                </div>
                {isInputCollapsed ? (
                  <ChevronUp className="w-4 h-4" style={{ color: "#888" }} />
                ) : (
                  <ChevronDown className="w-4 h-4" style={{ color: "#888" }} />
                )}
              </button>
              
              {!isInputCollapsed && (
                <div className="mt-4">
                  <Textarea
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="参加者の名前を入力（1行に1名）"
                    className="min-h-32 text-sm resize-none bg-white border-2"
                    style={{ borderColor: `${themeConfig.primaryColor}30` }}
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
