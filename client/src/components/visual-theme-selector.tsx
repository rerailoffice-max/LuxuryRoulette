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
    primaryColor: "#F59E0B",
    accentColor: "#FCD34D",
    confettiColors: ["#FFD700", "#FFA500", "#FF6347", "#00FF00", "#00CED1", "#FF1493"],
    glowColor: "rgba(245, 158, 11, 0.6)"
  },
  casino: {
    id: "casino",
    name: "カジノ",
    icon: Sparkles,
    primaryColor: "#DC2626",
    accentColor: "#FFD700",
    confettiColors: ["#DC2626", "#FFD700", "#000000", "#FFFFFF", "#B91C1C", "#FEF08A"],
    glowColor: "rgba(220, 38, 38, 0.6)"
  },
  festival: {
    id: "festival",
    name: "パーティー",
    icon: PartyPopper,
    primaryColor: "#EC4899",
    accentColor: "#8B5CF6",
    confettiColors: ["#EC4899", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"],
    glowColor: "rgba(236, 72, 153, 0.6)"
  },
  corporate: {
    id: "corporate",
    name: "ビジネス",
    icon: Building2,
    primaryColor: "#3B82F6",
    accentColor: "#60A5FA",
    confettiColors: ["#3B82F6", "#60A5FA", "#1E40AF", "#93C5FD", "#1E3A8A", "#DBEAFE"],
    glowColor: "rgba(59, 130, 246, 0.6)"
  }
};

export function VisualThemeSelector({ currentTheme, onThemeChange }: VisualThemeSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="button-toggle-visual-theme"
      >
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <span className="font-medium">テーマ</span>
          <span className="text-sm text-muted-foreground">
            ({THEME_CONFIGS[currentTheme].name})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
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
                variant={isSelected ? "default" : "outline"}
                className="flex flex-col items-center justify-center h-24 p-3 gap-2"
                style={{
                  backgroundColor: isSelected ? theme.primaryColor : undefined,
                  borderColor: isSelected ? theme.primaryColor : undefined,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onThemeChange(theme.id);
                }}
                data-testid={`button-theme-${theme.id}`}
              >
                <Icon 
                  className="w-6 h-6" 
                  style={{ color: isSelected ? "#fff" : theme.primaryColor }}
                />
                <span 
                  className="text-xs font-medium text-center"
                  style={{ color: isSelected ? "#fff" : undefined }}
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
