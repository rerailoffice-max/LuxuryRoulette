import { Card } from "@/components/ui/card";
import { 
  RotateCw, 
  CircleDot, 
  Layers, 
  Grip,
  Circle,
  Target
} from "lucide-react";

export type AnimationType = "nameRoulette" | "wheel" | "cardFlip" | "slotMachine" | "gacha" | "bingo";

export interface AnimationTypeConfig {
  id: AnimationType;
  name: string;
  description: string;
  icon: typeof RotateCw;
}

export const ANIMATION_TYPES: AnimationTypeConfig[] = [
  {
    id: "nameRoulette",
    name: "名前ルーレット",
    description: "シンプルに名前が切り替わる",
    icon: RotateCw,
  },
  {
    id: "wheel",
    name: "ルーレットホイール",
    description: "円盤が回転するTV風演出",
    icon: CircleDot,
  },
  {
    id: "cardFlip",
    name: "カードフリップ",
    description: "カードをめくって当選者発表",
    icon: Layers,
  },
  {
    id: "slotMachine",
    name: "スロットマシン",
    description: "3列リールが回転する",
    icon: Grip,
  },
  {
    id: "gacha",
    name: "ガチャカプセル",
    description: "カプセルが出てくる演出",
    icon: Circle,
  },
  {
    id: "bingo",
    name: "ビンゴ抽選機",
    description: "球が出てくるお祭り風",
    icon: Target,
  },
];

interface AnimationTypeSelectorProps {
  value: AnimationType;
  onChange: (type: AnimationType) => void;
  accentColor?: string;
}

export function AnimationTypeSelector({ 
  value, 
  onChange,
  accentColor = "#FFD700"
}: AnimationTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">抽選アニメーション</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {ANIMATION_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = value === type.id;
          
          return (
            <Card
              key={type.id}
              onClick={() => onChange(type.id)}
              data-testid={`button-animation-type-${type.id}`}
              className={`p-3 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? "ring-2 bg-white/10" 
                  : "bg-gray-900/50 hover:bg-gray-800/50"
              }`}
              style={{
                borderColor: isSelected ? accentColor : "rgba(255,255,255,0.1)",
                boxShadow: isSelected ? `0 0 0 2px ${accentColor}` : undefined,
              }}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <Icon 
                  className="w-8 h-8" 
                  style={{ color: isSelected ? accentColor : "rgba(255,255,255,0.7)" }}
                />
                <div>
                  <p 
                    className="font-medium text-sm"
                    style={{ color: isSelected ? accentColor : "white" }}
                  >
                    {type.name}
                  </p>
                  <p className="text-xs text-white/60 mt-0.5">
                    {type.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
