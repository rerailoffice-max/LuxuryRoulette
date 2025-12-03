import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Settings, 
  ChevronDown, 
  ChevronUp,
  Zap,
  Clock
} from "lucide-react";

export interface RouletteSettings {
  spinDuration: number;
  spinSpeed: number;
}

interface RouletteSettingsProps {
  settings: RouletteSettings;
  onSettingsChange: (settings: RouletteSettings) => void;
}

export const DEFAULT_ROULETTE_SETTINGS: RouletteSettings = {
  spinDuration: 4,
  spinSpeed: 50
};

export function RouletteSettingsPanel({ settings, onSettingsChange }: RouletteSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="bg-gray-900/90 backdrop-blur-sm border-2 border-amber-400">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="button-toggle-settings"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-400" />
          <span className="font-medium text-white">ルーレット設定</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-white/70" />
        ) : (
          <ChevronDown className="w-5 h-5 text-white/70" />
        )}
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-white">
                <Clock className="w-4 h-4 text-amber-400" />
                回転時間
              </Label>
              <span className="text-sm text-amber-400 font-bold" data-testid="text-spin-duration">
                {settings.spinDuration}秒
              </span>
            </div>
            <Slider
              value={[settings.spinDuration]}
              onValueChange={(value) => 
                onSettingsChange({ ...settings, spinDuration: value[0] })
              }
              min={2}
              max={10}
              step={1}
              className="w-full"
              data-testid="slider-spin-duration"
            />
            <div className="flex justify-between text-xs text-white/60">
              <span>短め (2秒)</span>
              <span>ドキドキ (10秒)</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-white">
                <Zap className="w-4 h-4 text-amber-400" />
                回転スピード
              </Label>
              <span className="text-sm text-amber-400 font-bold" data-testid="text-spin-speed">
                {settings.spinSpeed === 30 ? "速い" : settings.spinSpeed === 50 ? "普通" : "ゆっくり"}
              </span>
            </div>
            <Slider
              value={[settings.spinSpeed]}
              onValueChange={(value) => 
                onSettingsChange({ ...settings, spinSpeed: value[0] })
              }
              min={30}
              max={80}
              step={10}
              className="w-full"
              data-testid="slider-spin-speed"
            />
            <div className="flex justify-between text-xs text-white/60">
              <span>速い</span>
              <span>ゆっくり</span>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onSettingsChange(DEFAULT_ROULETTE_SETTINGS);
            }}
            className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
            data-testid="button-reset-settings"
          >
            初期設定に戻す
          </Button>
        </div>
      )}
    </Card>
  );
}
