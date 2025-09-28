'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Report, ReportPreview } from '@/types'
import { formatDate, truncateText, getWordCount } from '@/lib/utils'
import { FileText, Calendar, Building } from 'lucide-react'

interface ReportPreviewsProps {
  onReportSelect: (report: Report) => void
}

export function ReportPreviews({ onReportSelect }: ReportPreviewsProps) {
  const [previews, setPreviews] = useState<ReportPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecentReports()
  }, [])

  const fetchRecentReports = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/reports/recent?limit=6')
      if (!response.ok) {
        throw new Error('Failed to fetch reports')
      }

      const data = await response.json()

      const reportPreviews: ReportPreview[] = data.reports.map((report: Report) => ({
        agency: report.agency,
        month: report.month,
        year: report.year,
        preview: truncateText(report.report, 150),
        wordCount: getWordCount(report.report),
      }))

      setPreviews(reportPreviews)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handlePreviewClick = async (preview: ReportPreview) => {
    try {
      const response = await fetch(
        `/api/reports?agency=${encodeURIComponent(preview.agency)}&month=${preview.month}&year=${preview.year}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch full report')
      }

      const data = await response.json()
      if (data.reports && data.reports.length > 0) {
        onReportSelect(data.reports[0])
      }
    } catch (err) {
      console.error('Error fetching full report:', err)
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchRecentReports} variant="outline" className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-md border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Recent Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {previews.map((preview) => (
            <div
              key={`${preview.agency}-${preview.month}-${preview.year}`}
              className="p-4 border border-white/20 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/80 hover:bg-white/90 backdrop-blur-sm hover:scale-105 hover:border-primary/30"
              onClick={() => handlePreviewClick(preview)}
            >
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Building className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <h3 className="font-semibold text-sm text-foreground leading-tight">
                    {preview.agency} - {formatDate(preview.month, preview.year)}
                  </h3>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {preview.preview}
                </p>

                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{preview.wordCount} words</span>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                    View Full Report
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {previews.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No reports found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}