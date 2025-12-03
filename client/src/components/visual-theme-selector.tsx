import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ChevronDown, 
  ChevronUp,
  Palette,
  Sparkles,
  PartyPopper,
  Building2
} from "lucide-react";
import { useState } from "react";

export type VisualTheme = "default" | "casino" | "festival" | "corporate";

interface VisualThemeSelectorProps {
  currentTheme: VisualTheme;
  onThemeChange: (theme: VisualTheme) => void;
}

interface ThemeConfig {
  id: VisualTheme;
  name: string;
  icon: typeof Sparkles;
  primaryColor: string;
  accentColor: string;
  confettiColors: string[];
  glowColor: string;
}

export const THEME_CONFIGS: Record<VisualTheme, ThemeConfig> = {
  default: {
    id: "default",
    name: "ゴールデン",
    icon: Sparkles,
    primaryColor: "#B8860B",
    accentColor: "#FFD700",
    confettiColors: ["#FFD700", "#FFA500", "#FF6347", "#00FF00", "#00CED1", "#FF1493"],
    glowColor: "rgba(184, 134, 11, 0.8)"
  },
  casino: {
    id: "casino",
    name: "カジノ",
    icon: Sparkles,
    primaryColor: "#B91C1C",
    accentColor: "#FFD700",
    confettiColors: ["#DC2626", "#FFD700", "#000000", "#FFFFFF", "#B91C1C", "#FEF08A"],
    glowColor: "rgba(185, 28, 28, 0.8)"
  },
  festival: {
    id: "festival",
    name: "パーティー",
    icon: PartyPopper,
    primaryColor: "#BE185D",
    accentColor: "#7C3AED",
    confettiColors: ["#EC4899", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"],
    glowColor: "rgba(190, 24, 93, 0.8)"
  },
  corporate: {
    id: "corporate",
    name: "ビジネス",
    icon: Building2,
    primaryColor: "#1D4ED8",
    accentColor: "#3B82F6",
    confettiColors: ["#3B82F6", "#60A5FA", "#1E40AF", "#93C5FD", "#1E3A8A", "#DBEAFE"],
    glowColor: "rgba(29, 78, 216, 0.8)"
  }
};

export function VisualThemeSelector({ currentTheme, onThemeChange }: VisualThemeSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentConfig = THEME_CONFIGS[currentTheme];

  return (
    <Card className="bg-gray-900/90 backdrop-blur-sm border-2" style={{ borderColor: currentConfig.accentColor }}>
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="button-toggle-visual-theme"
      >
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5" style={{ color: currentConfig.accentColor }} />
          <span className="font-medium text-white">テーマ</span>
          <span className="text-sm text-white/70">
            ({currentConfig.name})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-white/70" />
        ) : (
          <ChevronDown className="w-5 h-5 text-white/70" />
        )}
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 grid grid-cols-2 gap-3">
          {Object.values(THEME_CONFIGS).map((theme) => {
            const Icon = theme.icon;
            const isSelected = currentTheme === theme.id;
            
            return (
              <Button
                key={theme.id}
                variant="outline"
                className="flex flex-col items-center justify-center h-24 p-3 gap-2"
                style={{
                  backgroundColor: isSelected ? theme.accentColor : "rgba(255,255,255,0.05)",
                  borderColor: theme.accentColor,
                  borderWidth: isSelected ? "3px" : "1px",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onThemeChange(theme.id);
                }}
                data-testid={`button-theme-${theme.id}`}
              >
                <Icon 
                  className="w-6 h-6" 
                  style={{ color: isSelected ? "#1a1a2e" : theme.accentColor }}
                />
                <span 
                  className="text-xs font-bold text-center"
                  style={{ color: isSelected ? "#1a1a2e" : "white" }}
                >
                  {theme.name}
                </span>
                <div className="flex gap-1">
                  {theme.confettiColors.slice(0, 4).map((color, i) => (
                    <div 
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </Button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
