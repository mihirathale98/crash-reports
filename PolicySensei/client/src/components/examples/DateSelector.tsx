import DateSelector from '../DateSelector'
import { useState } from 'react'

export default function DateSelectorExample() {
  const [selectedMonth, setSelectedMonth] = useState('11');
  const [selectedYear, setSelectedYear] = useState('2024');
  
  const handleDateChange = (month: string, year: string) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };
  
  return (
    <DateSelector 
      selectedMonth={selectedMonth}
      selectedYear={selectedYear}
      onDateChange={handleDateChange} 
    />
  )
}