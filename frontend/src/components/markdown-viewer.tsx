'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Report } from '@/types'
import { formatDate } from '@/lib/utils'

interface MarkdownViewerProps {
  report: Report | null
  loading?: boolean
}

export function MarkdownViewer({ report, loading }: MarkdownViewerProps) {
  if (loading) {
    return (
      <Card className="w-full bg-white/90 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary animate-pulse">
            Loading Report...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!report) {
    return (
      <Card className="w-full bg-white/90 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">
            No Report Selected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Select an agency, month, and year to view the corresponding report.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-white/95 backdrop-blur-md border-white/20 shadow-xl animate-fade-in-up">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-primary">
          {report.agency}
        </CardTitle>
        <p className="text-muted-foreground text-lg">
          {formatDate(report.month, report.year)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold mb-6 text-primary border-b border-border pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-semibold mb-4 mt-8 text-primary">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold mb-3 mt-6 text-primary">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-4 leading-7 text-foreground">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-4 space-y-2 text-foreground">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-4 space-y-2 text-foreground">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-7 text-foreground">
                  {children}
                </li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary bg-muted p-4 my-6 italic">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="my-6 overflow-x-auto rounded-lg border border-border shadow-sm">
                  <table className="w-full border-collapse bg-card">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-gradient-to-r from-primary/10 to-primary/5">
                  {children}
                </thead>
              ),
              th: ({ children }) => (
                <th className="border-b border-border bg-gradient-to-r from-primary/20 to-primary/10 px-4 py-3 text-left font-semibold text-primary">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border-b border-border/50 px-4 py-3 hover:bg-muted/50 transition-colors">
                  {children}
                </td>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-primary">
                  {children}
                </strong>
              ),
              code: ({ children }) => (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
                  {children}
                </pre>
              ),
            }}
          >
            {report.report}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}