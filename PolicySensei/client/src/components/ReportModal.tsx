import { X, Download, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: {
    agency: string;
    month: number;
    year: number;
    summary: {
      title: string;
      summary: string;
      sentiment: string;
      priority_issues: string[];
      recommendations_count: number;
      severity_score: number;
    };
    report: string;
  } | null;
}

export default function ReportModal({ isOpen, onClose, report }: ReportModalProps) {
  if (!report) return null;

  const formatMarkdown = (markdown: string) => {
    // Simple and reliable markdown to HTML conversion
    const lines = markdown.split('\n');
    let result: string[] = [];
    let inUL = false;
    let inOL = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Close lists if we're not in a list item anymore
      if (inUL && !line.match(/^- /)) {
        result.push('</ul>');
        inUL = false;
      }
      if (inOL && !line.match(/^\d+\. /)) {
        result.push('</ol>');
        inOL = false;
      }

      // Headers
      if (line.startsWith('### ')) {
        result.push(`<h3 class="text-lg font-semibold mt-6 mb-3">${line.substring(4)}</h3>`);
      } else if (line.startsWith('## ')) {
        result.push(`<h2 class="text-xl font-bold mt-8 mb-4 border-b pb-2">${line.substring(3)}</h2>`);
      } else if (line.startsWith('# ')) {
        result.push(`<h1 class="text-2xl font-bold mt-8 mb-6 border-b-2 pb-3">${line.substring(2)}</h1>`);
      }
      // Unordered lists
      else if (line.match(/^- /)) {
        if (!inUL) {
          result.push('<ul class="list-disc ml-6 my-4 space-y-1">');
          inUL = true;
        }
        result.push(`<li>${line.substring(2)}</li>`);
      }
      // Ordered lists
      else if (line.match(/^\d+\. /)) {
        if (!inOL) {
          result.push('<ol class="list-decimal ml-6 my-4 space-y-1">');
          inOL = true;
        }
        result.push(`<li>${line.replace(/^\d+\. /, '')}</li>`);
      }
      // Empty lines
      else if (line.trim() === '') {
        result.push('<br>');
      }
      // Regular paragraphs
      else {
        // Apply inline formatting
        line = line
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
          .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>');

        result.push(`<p class="mb-4 leading-relaxed">${line}</p>`);
      }
    }

    // Close any remaining lists
    if (inUL) result.push('</ul>');
    if (inOL) result.push('</ol>');

    return result.join('\n');
  };

  const handleDownload = () => {
    const blob = new Blob([report.report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.agency}_${report.year}_${report.month}_report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: report.summary.title,
        text: report.summary.summary,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{report.agency}</Badge>
                <Badge variant={report.summary.sentiment === 'negative' ? "destructive" :
                              report.summary.sentiment === 'positive' ? "default" : "secondary"}>
                  {report.summary.sentiment}
                </Badge>
                <Badge variant={report.summary.severity_score >= 4 ? "destructive" :
                              report.summary.severity_score >= 3 ? "default" : "secondary"}>
                  Priority {report.summary.severity_score}
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold">
                {report.summary.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                {report.summary.summary}
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {report.summary.priority_issues && report.summary.priority_issues.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Key Issues:</h4>
              <div className="flex flex-wrap gap-1">
                {report.summary.priority_issues.map((issue, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {issue}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh] pr-4">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(report.report) }}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}