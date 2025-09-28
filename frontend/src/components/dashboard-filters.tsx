'use client'

import { useState } from 'react'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AgencyOption } from '@/types'

interface DashboardFiltersProps {
  onFiltersChange: (filters: { agency: string; month: number; year: number }) => void
  onSearch: () => void
  loading?: boolean
}

const AGENCIES: AgencyOption[] = [
  { value: 'Registry of Motor Vehicles', label: 'Registry of Motor Vehicles' },
  { value: 'Department of Public Health', label: 'Department of Public Health' },
  { value: 'MassHealth', label: 'MassHealth' },
  { value: 'Massachusetts State Police', label: 'Massachusetts State Police' },
  { value: 'Massachusetts Bay Transportation Authority (MBTA)', label: 'MBTA' },
  { value: 'Department of Revenue', label: 'Department of Revenue' },
  { value: 'Department of Elementary and Secondary Education', label: 'Department of Education' },
  { value: 'Department of Environmental Protection', label: 'Environmental Protection' },
  { value: 'Massachusetts Emergency Management Agency (MEMA)', label: 'Emergency Management (MEMA)' },
  { value: 'Department of Unemployment Assistance', label: 'Unemployment Assistance' },
  { value: 'Department of Children and Families', label: 'Children and Families' },
]

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

const YEARS = Array.from({ length: 6 }, (_, i) => {
  const year = new Date().getFullYear() - i
  return { value: year, label: year.toString() }
})

export function DashboardFilters({ onFiltersChange, onSearch, loading }: DashboardFiltersProps) {
  const [agency, setAgency] = useState('')
  const [month, setMonth] = useState<number>(9) // Default to September
  const [year, setYear] = useState<number>(2025) // Default to 2025

  const handleFilterChange = () => {
    if (agency && month && year) {
      onFiltersChange({ agency, month, year })
    }
  }

  const handleSearch = () => {
    if (agency && month && year) {
      handleFilterChange()
      onSearch()
    }
  }

  return (
    <Card className="w-full bg-white/90 backdrop-blur-md border-white/20 shadow-xl animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary">Filter Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Agency</label>
            <Select
              placeholder="Select Agency"
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
            >
              {AGENCIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Month</label>
            <Select
              value={month.toString()}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Year</label>
            <Select
              value={year.toString()}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {YEARS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Button
              onClick={handleSearch}
              disabled={!agency || !month || !year || loading}
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Loading...' : 'View Report'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}