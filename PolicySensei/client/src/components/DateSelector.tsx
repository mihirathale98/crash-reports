import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface DateSelectorProps {
  selectedMonth: string;
  selectedYear: string;
  onDateChange: (month: string, year: string) => void;
}

export default function DateSelector({ selectedMonth, selectedYear, onDateChange }: DateSelectorProps) {
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentMonthIndex = months.findIndex(m => m.value === selectedMonth);
    const currentYearNum = parseInt(selectedYear);
    
    if (direction === 'prev') {
      if (currentMonthIndex === 0) {
        onDateChange('12', (currentYearNum - 1).toString());
      } else {
        onDateChange(months[currentMonthIndex - 1].value, selectedYear);
      }
    } else {
      if (currentMonthIndex === 11) {
        onDateChange('01', (currentYearNum + 1).toString());
      } else {
        onDateChange(months[currentMonthIndex + 1].value, selectedYear);
      }
    }
    console.log(`Navigated ${direction} to ${selectedMonth}/${selectedYear}`);
  };

  const selectedMonthLabel = months.find(m => m.value === selectedMonth)?.label || '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Reporting Period
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select month for insight analysis
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            data-testid="button-prev-month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="text-center">
            <div className="font-semibold text-lg">
              {selectedMonthLabel} {selectedYear}
            </div>
            <div className="text-sm text-muted-foreground">
              Current period
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            data-testid="button-next-month"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select
            value={selectedMonth}
            onValueChange={(value) => onDateChange(value, selectedYear)}
          >
            <SelectTrigger data-testid="select-month">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedYear}
            onValueChange={(value) => onDateChange(selectedMonth, value)}
          >
            <SelectTrigger data-testid="select-year">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Last updated: 2 hours ago
        </div>
      </CardContent>
    </Card>
  );
}