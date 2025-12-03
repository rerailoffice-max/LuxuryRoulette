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

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  drumRollUrl: "https://www.soundjay.com/misc/sounds/drum-roll-01.mp3",
  fanfareUrl: "https://www.soundjay.com/misc/sounds/ta-da-1.mp3",
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
      alert("Please select an audio file (MP3, WAV, OGG, etc.)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
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
  }, [settings.drumRollUrl, settings.fanfareUrl]);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="button-toggle-sound-settings"
      >
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          <span className="font-medium">Sound Effects</span>
          <span className="text-sm text-muted-foreground">
            ({settings.drumRollName || settings.fanfareName 
              ? "Custom" 
              : "Default"})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium">Drum Roll (during spin)</label>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => previewSound("drumRoll")}
                  disabled={isPlayingDrumRoll}
                  data-testid="button-preview-drumroll"
                  aria-label="Preview drum roll"
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
                    data-testid="button-reset-drumroll"
                    aria-label="Reset to default drum roll"
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
                className="flex-1"
                onClick={() => drumRollInputRef.current?.click()}
                data-testid="button-upload-drumroll"
              >
                <Upload className="w-4 h-4 mr-2" />
                {settings.drumRollName || "Upload custom sound"}
              </Button>
            </div>
            {!settings.drumRollName && (
              <p className="text-xs text-muted-foreground">Using default drum roll</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium">Fanfare (winner reveal)</label>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => previewSound("fanfare")}
                  disabled={isPlayingFanfare}
                  data-testid="button-preview-fanfare"
                  aria-label="Preview fanfare"
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
                    data-testid="button-reset-fanfare"
                    aria-label="Reset to default fanfare"
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
                className="flex-1"
                onClick={() => fanfareInputRef.current?.click()}
                data-testid="button-upload-fanfare"
              >
                <Upload className="w-4 h-4 mr-2" />
                {settings.fanfareName || "Upload custom sound"}
              </Button>
            </div>
            {!settings.fanfareName && (
              <p className="text-xs text-muted-foreground">Using default fanfare</p>
            )}
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Supported formats: MP3, WAV, OGG (max 10MB)
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
