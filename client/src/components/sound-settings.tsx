import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ChevronDown, 
  ChevronUp,
  Music,
  Upload,
  RotateCcw,
  Play,
  Volume2
} from "lucide-react";
import { useState, useRef, useCallback } from "react";

export interface SoundSettings {
  drumRollUrl: string;
  fanfareUrl: string;
  drumRollName: string | null;
  fanfareName: string | null;
}

// Generate drum roll sound using Web Audio API
export function createDrumRollSound(audioContext: AudioContext): OscillatorNode {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  return oscillator;
}

// Generate fanfare sound using Web Audio API
export function createFanfareSound(audioContext: AudioContext): void {
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  const duration = 0.3;
  
  notes.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
    
    const startTime = audioContext.currentTime + index * duration;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  });
}

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  drumRollUrl: "",
  fanfareUrl: "",
  drumRollName: null,
  fanfareName: null,
};

interface SoundSettingsProps {
  settings: SoundSettings;
  onSettingsChange: (settings: SoundSettings) => void;
}

export function SoundSettingsPanel({ settings, onSettingsChange }: SoundSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlayingDrumRoll, setIsPlayingDrumRoll] = useState(false);
  const [isPlayingFanfare, setIsPlayingFanfare] = useState(false);
  
  const drumRollInputRef = useRef<HTMLInputElement>(null);
  const fanfareInputRef = useRef<HTMLInputElement>(null);
  const drumRollAudioRef = useRef<HTMLAudioElement | null>(null);
  const fanfareAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleFileUpload = useCallback((
    event: React.ChangeEvent<HTMLInputElement>,
    type: "drumRoll" | "fanfare"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      alert("音声ファイルを選択してください（MP3, WAV, OGGなど）");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("ファイルサイズは10MB以下にしてください");
      return;
    }

    const url = URL.createObjectURL(file);
    
    if (type === "drumRoll") {
      if (settings.drumRollUrl && settings.drumRollName) {
        URL.revokeObjectURL(settings.drumRollUrl);
      }
      onSettingsChange({
        ...settings,
        drumRollUrl: url,
        drumRollName: file.name,
      });
    } else {
      if (settings.fanfareUrl && settings.fanfareName) {
        URL.revokeObjectURL(settings.fanfareUrl);
      }
      onSettingsChange({
        ...settings,
        fanfareUrl: url,
        fanfareName: file.name,
      });
    }
  }, [settings, onSettingsChange]);

  const resetToDefault = useCallback((type: "drumRoll" | "fanfare") => {
    if (type === "drumRoll") {
      if (settings.drumRollName) {
        URL.revokeObjectURL(settings.drumRollUrl);
      }
      onSettingsChange({
        ...settings,
        drumRollUrl: DEFAULT_SOUND_SETTINGS.drumRollUrl,
        drumRollName: null,
      });
      if (drumRollInputRef.current) {
        drumRollInputRef.current.value = "";
      }
    } else {
      if (settings.fanfareName) {
        URL.revokeObjectURL(settings.fanfareUrl);
      }
      onSettingsChange({
        ...settings,
        fanfareUrl: DEFAULT_SOUND_SETTINGS.fanfareUrl,
        fanfareName: null,
      });
      if (fanfareInputRef.current) {
        fanfareInputRef.current.value = "";
      }
    }
  }, [settings, onSettingsChange]);

  const previewSound = useCallback((type: "drumRoll" | "fanfare") => {
    const url = type === "drumRoll" ? settings.drumRollUrl : settings.fanfareUrl;
    const setPlaying = type === "drumRoll" ? setIsPlayingDrumRoll : setIsPlayingFanfare;
    const audioRef = type === "drumRoll" ? drumRollAudioRef : fanfareAudioRef;

    // If using custom audio file
    if (url) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      setPlaying(true);
      
      audio.play().catch((e) => {
        console.error("Failed to play audio:", e);
        setPlaying(false);
      });
      
      audio.onended = () => {
        setPlaying(false);
        audioRef.current = null;
      };
      
      audio.onerror = () => {
        setPlaying(false);
        audioRef.current = null;
      };
    } else {
      // Use Web Audio API for default sounds
      try {
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        setPlaying(true);
        
        if (type === "drumRoll") {
          // Preview drum roll for 1.5 seconds
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          const lfoOsc = audioContext.createOscillator();
          const lfoGain = audioContext.createGain();
          
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
          
          lfoOsc.type = 'sine';
          lfoOsc.frequency.setValueAtTime(20, audioContext.currentTime);
          lfoGain.gain.setValueAtTime(0.3, audioContext.currentTime);
          
          lfoOsc.connect(lfoGain);
          lfoGain.connect(gainNode.gain);
          
          gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.start();
          lfoOsc.start();
          
          setTimeout(() => {
            oscillator.stop();
            lfoOsc.stop();
            setPlaying(false);
            audioContext.close();
          }, 1500);
        } else {
          // Play fanfare
          createFanfareSound(audioContext);
          setTimeout(() => {
            setPlaying(false);
            audioContext.close();
          }, 1200);
        }
      } catch (e) {
        console.error("Failed to play audio:", e);
        setPlaying(false);
      }
    }
  }, [settings.drumRollUrl, settings.fanfareUrl]);

  return (
    <Card className="bg-gray-900/90 backdrop-blur-sm border-2 border-amber-400">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="button-toggle-sound-settings"
      >
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-amber-400" />
          <span className="font-medium text-white">効果音</span>
          <span className="text-sm text-white/70">
            ({settings.drumRollName || settings.fanfareName 
              ? "カスタム" 
              : "デフォルト"})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-white/70" />
        ) : (
          <ChevronDown className="w-5 h-5 text-white/70" />
        )}
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-white">ドラムロール（回転中）</label>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => previewSound("drumRoll")}
                  disabled={isPlayingDrumRoll}
                  className="text-amber-400 hover:bg-white/10"
                  data-testid="button-preview-drumroll"
                  aria-label="ドラムロールを試聴"
                >
                  {isPlayingDrumRoll ? (
                    <Volume2 className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                {settings.drumRollName && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => resetToDefault("drumRoll")}
                    className="text-white/70 hover:bg-white/10"
                    data-testid="button-reset-drumroll"
                    aria-label="デフォルトに戻す"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={drumRollInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileUpload(e, "drumRoll")}
                className="hidden"
                id="drumroll-upload"
                data-testid="input-drumroll-file"
              />
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => drumRollInputRef.current?.click()}
                data-testid="button-upload-drumroll"
              >
                <Upload className="w-4 h-4 mr-2" />
                {settings.drumRollName || "カスタム音声をアップロード"}
              </Button>
            </div>
            {!settings.drumRollName && (
              <p className="text-xs text-white/50">デフォルトのドラムロールを使用中</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-white">ファンファーレ（当選時）</label>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => previewSound("fanfare")}
                  disabled={isPlayingFanfare}
                  className="text-amber-400 hover:bg-white/10"
                  data-testid="button-preview-fanfare"
                  aria-label="ファンファーレを試聴"
                >
                  {isPlayingFanfare ? (
                    <Volume2 className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                {settings.fanfareName && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => resetToDefault("fanfare")}
                    className="text-white/70 hover:bg-white/10"
                    data-testid="button-reset-fanfare"
                    aria-label="デフォルトに戻す"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fanfareInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileUpload(e, "fanfare")}
                className="hidden"
                id="fanfare-upload"
                data-testid="input-fanfare-file"
              />
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => fanfareInputRef.current?.click()}
                data-testid="button-upload-fanfare"
              >
                <Upload className="w-4 h-4 mr-2" />
                {settings.fanfareName || "カスタム音声をアップロード"}
              </Button>
            </div>
            {!settings.fanfareName && (
              <p className="text-xs text-white/50">デフォルトのファンファーレを使用中</p>
            )}
          </div>

          <div className="pt-2 border-t border-white/20">
            <p className="text-xs text-white/50">
              対応形式: MP3, WAV, OGG（最大10MB）
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
