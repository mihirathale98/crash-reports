import { ExternalLink, Share2, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Sentiment = 'positive' | 'negative' | 'neutral';

interface InsightCardProps {
  id: string;
  title: string;
  summary: string;
  sentiment: Sentiment;
  agency: string;
  sourceUrl: string;
  sourceTitle: string;
  postedDate: string;
  engagementCount: number;
  priority_issues?: string[];
  recommendations_count?: number;
  severity_score?: number;
  onCardClick?: () => void;
}

export default function InsightCard({
  id,
  title,
  summary,
  sentiment,
  agency,
  sourceUrl,
  sourceTitle,
  postedDate,
  engagementCount,
  priority_issues,
  recommendations_count,
  severity_score,
  onCardClick,
}: InsightCardProps) {
  const getSentimentConfig = (sentiment: Sentiment) => {
    switch (sentiment) {
      case 'positive':
        return {
          icon: ThumbsUp,
          color: 'bg-chart-1',
          textColor: 'text-chart-1',
          label: 'Positive'
        };
      case 'negative':
        return {
          icon: ThumbsDown,
          color: 'bg-chart-3',
          textColor: 'text-chart-3',
          label: 'Negative'
        };
      default:
        return {
          icon: Minus,
          color: 'bg-muted',
          textColor: 'text-muted-foreground',
          label: 'Neutral'
        };
    }
  };

  const sentimentConfig = getSentimentConfig(sentiment);
  const SentimentIcon = sentimentConfig.icon;

  const handleShare = (method: string) => {
    console.log(`Sharing insight ${id} via ${method}`);
  };

  return (
    <Card className="hover-elevate transition-all duration-150 cursor-pointer" onClick={onCardClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {agency}
              </Badge>
              <div className={`flex items-center gap-1 text-xs ${sentimentConfig.textColor}`}>
                <SentimentIcon className="w-3 h-3" />
                {sentimentConfig.label}
              </div>
              {severity_score && (
                <Badge variant={severity_score >= 4 ? "destructive" : severity_score >= 3 ? "default" : "secondary"} className="text-xs">
                  Priority {severity_score}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-base leading-tight mb-2">
              {title}
            </h3>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                data-testid={`button-share-${id}`}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleShare('copy')}>
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('email')}>
                Share via Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-foreground leading-relaxed mb-4">
          {summary}
        </p>

        {priority_issues && priority_issues.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Key Issues:</h4>
            <div className="flex flex-wrap gap-1">
              {priority_issues.slice(0, 3).map((issue, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {issue}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{postedDate}</span>
            {recommendations_count && (
              <span>{recommendations_count} recommendations</span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              console.log(`Opening Reddit thread: ${sourceUrl}`);
              window.open(sourceUrl, '_blank');
            }}
            data-testid={`button-source-${id}`}
          >
            <ExternalLink className="w-3 h-3 mr-2" />
            View Full Report
          </Button>
        </div>

        <div className="mt-2 text-xs text-muted-foreground">
          Source: {sourceTitle}
        </div>
      </CardContent>
    </Card>
  );
}