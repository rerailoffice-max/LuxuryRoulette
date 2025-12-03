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
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportToCSV = () => {
    const headers = "Round,Winner,Time\n";
    const rows = winners.map(w => 
      `${w.round},"${w.name}",${formatTime(w.timestamp)}`
    ).join("\n");
    
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lucky-draw-winners-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    const text = winners.map(w => 
      `Round ${w.round}: ${w.name} (${formatTime(w.timestamp)})`
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
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="button-toggle-history"
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="font-medium">
            Winner History ({winners.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
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
              data-testid="button-export-csv"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard();
              }}
              data-testid="button-copy-history"
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="text-muted-foreground"
              data-testid="button-clear-history"
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {winners.map((winner, index) => (
              <div 
                key={`${winner.name}-${winner.round}`}
                className="flex items-center justify-between p-3 rounded-md bg-background/50 border border-border/50"
                data-testid={`winner-record-${index}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-primary bg-primary/20 px-2 py-1 rounded-full">
                    #{winner.round}
                  </span>
                  <span className="font-medium text-foreground">
                    {winner.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
