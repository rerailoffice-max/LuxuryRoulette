import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Trophy, 
  Download, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Clock,
  X
} from "lucide-react";

export interface WinnerRecord {
  name: string;
  timestamp: Date;
  round: number;
}

interface WinnerHistoryProps {
  winners: WinnerRecord[];
  onClear: () => void;
}

export function WinnerHistory({ winners, onClear }: WinnerHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportToCSV = () => {
    const headers = "回,当選者,時刻\n";
    const rows = winners.map(w => 
      `${w.round},"${w.name}",${formatTime(w.timestamp)}`
    ).join("\n");
    
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `抽選結果-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    const text = winners.map(w => 
      `第${w.round}回: ${w.name} (${formatTime(w.timestamp)})`
    ).join("\n");
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (winners.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gray-900/90 backdrop-blur-sm border-2 border-amber-400">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="button-toggle-history"
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="font-medium text-white">
            当選履歴 ({winners.length}件)
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-white/70" />
        ) : (
          <ChevronDown className="w-5 h-5 text-white/70" />
        )}
      </div>

      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                exportToCSV();
              }}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              data-testid="button-export-csv"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV出力
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard();
              }}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              data-testid="button-copy-history"
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? "コピーしました！" : "コピー"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="text-white/60 hover:bg-white/10 hover:text-white"
              data-testid="button-clear-history"
            >
              <X className="w-4 h-4 mr-2" />
              クリア
            </Button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {winners.map((winner, index) => (
              <div 
                key={`${winner.name}-${winner.round}`}
                className="flex items-center justify-between p-3 rounded-md bg-white/10 border border-white/20"
                data-testid={`winner-record-${index}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-900 bg-amber-400 px-2 py-1 rounded-full">
                    第{winner.round}回
                  </span>
                  <span className="font-bold text-white">
                    {winner.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-white/60">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(winner.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
