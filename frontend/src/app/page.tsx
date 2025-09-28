'use client'

import { useState } from 'react'
import { DashboardFilters } from '@/components/dashboard-filters'
import { MarkdownViewer } from '@/components/markdown-viewer'
import { ReportPreviews } from '@/components/report-previews'
import { Report } from '@/types'
import { BarChart3, FileText, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFiltersChange = (filters: { agency: string; month: number; year: number }) => {
    // Filters are managed by the DashboardFilters component
  }

  const handleSearch = async () => {
    // This function will be called when user clicks "View Report"
    // The actual search is handled in the DashboardFilters component
  }

  const handleReportSearch = async (agency: string, month: number, year: number) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/reports?agency=${encodeURIComponent(agency)}&month=${month}&year=${year}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch report')
      }

      const data = await response.json()

      if (data.reports && data.reports.length > 0) {
        setSelectedReport(data.reports[0])
      } else {
        setSelectedReport(null)
        setError('No report found for the selected criteria')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setSelectedReport(null)
    } finally {
      setLoading(false)
    }
  }

  const handleReportSelect = (report: Report) => {
    setSelectedReport(report)
    setError(null)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/20 border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 animate-fade-in-up">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm animate-pulse-glow">
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Government Feedback Dashboard
              </h1>
              <p className="text-white/80 text-lg">
                Analyze public feedback and reports from Massachusetts government agencies
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Filters Section */}
          <DashboardFilters
            onFiltersChange={handleFiltersChange}
            onSearch={() => {
              // Get the current filter values and search
              const filterElements = document.querySelectorAll('select')
              if (filterElements.length >= 3) {
                const agency = (filterElements[0] as HTMLSelectElement).value
                const month = parseInt((filterElements[1] as HTMLSelectElement).value)
                const year = parseInt((filterElements[2] as HTMLSelectElement).value)

                if (agency && month && year) {
                  handleReportSearch(agency, month, year)
                }
              }
            }}
            loading={loading}
          />

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 backdrop-blur-sm text-red-600 p-4 rounded-xl border border-red-200/20 shadow-lg animate-fade-in-up">
              {error}
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Report Viewer */}
            <div className="xl:col-span-2">
              <MarkdownViewer report={selectedReport} loading={loading} />
            </div>

            {/* Right Column - Recent Reports */}
            <div className="xl:col-span-1">
              <ReportPreviews onReportSelect={handleReportSelect} />
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Total Reports</p>
                  <p className="text-3xl font-bold text-white">100+</p>
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Agencies Covered</p>
                  <p className="text-3xl font-bold text-white">11</p>
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Data Sources</p>
                  <p className="text-3xl font-bold text-white">Reddit</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-white/10 backdrop-blur-md mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-white/70">
            <p>
              Government Feedback Dashboard - Powered by BigQuery and Reddit Analysis
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}