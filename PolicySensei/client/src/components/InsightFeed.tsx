import { Mail, Filter, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InsightCard from "./InsightCard";
import ReportModal from "./ReportModal";
import { useState, useEffect } from "react";
import {
  getFilteredInsights,
  getSentimentCounts,
  getMonthNames,
  getAgencyDisplayName,
  getUILabels,
  getAppMetadata,
  type Agency
} from "@/lib/dataService";

interface InsightFeedProps {
  selectedAgency: Agency;
  selectedMonth: string;
  selectedYear: string;
  onSubscribeClick: () => void;
}

export default function InsightFeed({
  selectedAgency,
  selectedMonth,
  selectedYear,
  onSubscribeClick
}: InsightFeedProps) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const monthNames = getMonthNames();
  const uiLabels = getUILabels();
  const appMetadata = getAppMetadata();

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedMonth) params.append('month', selectedMonth);
        if (selectedYear) params.append('year', selectedYear);
        if (selectedAgency !== 'all') {
          params.append('agency', getAgencyDisplayName(selectedAgency));
        }

        const response = await fetch(`/api/reports?${params}`);
        const data = await response.json();

        if (data.reports) {
          setReports(data.reports);
        } else {
          console.error('Failed to fetch reports:', data.error || 'Unknown error');
          // Fallback to mock data
          const filteredInsights = getFilteredInsights(selectedAgency);
          setReports(filteredInsights);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        // Fallback to mock data
        const filteredInsights = getFilteredInsights(selectedAgency);
        setReports(filteredInsights);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [selectedAgency, selectedMonth, selectedYear]);

  const sentimentCounts = getSentimentCounts(reports.map(r => r.summary || r));

  const handleCardClick = (report: any) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section - Responsive layout */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2 break-words">
            {uiLabels.policyInsightsReport.title}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground break-words">
            {getAgencyDisplayName(selectedAgency)} • {monthNames[selectedMonth as keyof typeof monthNames]} {selectedYear}
          </p>
        </div>
        
        <Button 
          onClick={onSubscribeClick}
          data-testid="button-subscribe-main"
          className="gap-2 w-full sm:w-auto text-sm sm:text-base px-4 py-2 sm:px-4 sm:py-2"
          size="sm"
        >
          <Mail className="w-4 h-4" />
          <span className="hidden sm:inline">{uiLabels.policyInsightsReport.subscribeButton}</span>
          <span className="sm:hidden">{uiLabels.policyInsightsReport.subscribeButtonShort}</span>
        </Button>
      </div>

      {/* Summary Stats - Responsive grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground">Total Insights</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold mt-1">{reports.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-chart-1 rounded-full flex-shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground">Positive</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold mt-1">{sentimentCounts.positive}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-chart-3 rounded-full flex-shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground">Negative</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold mt-1">{sentimentCounts.negative}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-muted rounded-full flex-shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground">Neutral</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold mt-1">{sentimentCounts.neutral}</div>
          </CardContent>
        </Card>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-base sm:text-lg font-semibold">{uiLabels.topInsights.title}</h2>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            {uiLabels.topInsights.lastUpdated}
          </div>
        </div>
        
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-sm text-muted-foreground">Loading reports...</p>
            </CardContent>
          </Card>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Filter className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-1">{uiLabels.topInsights.noInsightsTitle}</h3>
              <p className="text-sm text-muted-foreground">
                {uiLabels.topInsights.noInsightsDescription}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report, index) => {
              const summary = report.summary || report;
              return (
                <InsightCard
                  key={report.id || index}
                  id={report.id || `report-${index}`}
                  title={summary.title}
                  summary={summary.summary}
                  sentiment={summary.sentiment}
                  agency={summary.agency || report.agency}
                  sourceUrl={summary.sourceUrl || "#"}
                  sourceTitle={summary.sourceTitle || `Government Report - ${report.agency}`}
                  postedDate={summary.postedDate || `${report.year}-${String(report.month).padStart(2, '0')}-01`}
                  engagementCount={summary.engagementCount || 0}
                  priority_issues={summary.priority_issues}
                  recommendations_count={summary.recommendations_count}
                  severity_score={summary.severity_score}
                  onCardClick={() => handleCardClick(report)}
                />
              );
            })}
          </div>
        )}

        <ReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          report={selectedReport}
        />
      </div>

      {/* Footer - Responsive layout */}
      <div className="text-center pt-6 sm:pt-8 border-t">
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 px-4">
          {appMetadata.description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-muted-foreground px-4">
          <span>Data sourced from {appMetadata.dataSources.join(', ')}</span>
          <span className="hidden sm:inline">•</span>
          <span>{appMetadata.updateFrequency}</span>
        </div>
      </div>
    </div>
  );
}