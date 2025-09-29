import { useState, useEffect } from "react";
import AppHeader from "./AppHeader";
import AgencyFilter from "./AgencyFilter";
import DateSelector from "./DateSelector";
import InsightFeed from "./InsightFeed";
import SubscriptionModal from "./SubscriptionModal";

import { type Agency, getAgencyDisplayName } from "@/lib/dataService";

export default function Dashboard() {
  const [selectedAgency, setSelectedAgency] = useState<Agency>('all');
  const [selectedMonth, setSelectedMonth] = useState('9');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [allReports, setAllReports] = useState<any[]>([]);

  const handleDateChange = (month: string, year: string) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    console.log(`Date changed to ${month}/${year}`);
  };

  // Fetch all reports for the selected month/year to calculate agency counts
  useEffect(() => {
    const fetchAllReports = async () => {
      try {
        const params = new URLSearchParams();
        if (selectedMonth) params.append('month', selectedMonth);
        if (selectedYear) params.append('year', selectedYear);

        const response = await fetch(`/api/reports?${params}`);
        const data = await response.json();

        if (data.reports) {
          setAllReports(data.reports);
        }
      } catch (error) {
        console.error('Error fetching all reports:', error);
        setAllReports([]);
      }
    };

    fetchAllReports();
  }, [selectedMonth, selectedYear]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Responsive: Stack vertically on mobile, side-by-side on large screens */}
        <div className="w-full lg:w-80 xl:w-96 p-4 sm:p-6 space-y-4 sm:space-y-6 border-b lg:border-b-0 lg:border-r bg-card/50">
          {/* DateSelector comes first - Reporting Period */}
          <DateSelector
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onDateChange={handleDateChange}
          />
          
          {/* AgencyFilter comes second - Filter by Agency */}
          <AgencyFilter
            selectedAgency={selectedAgency}
            onAgencyChange={setSelectedAgency}
            reports={allReports}
          />
        </div>

        {/* Main Content - Responsive width and padding */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <InsightFeed
            selectedAgency={selectedAgency}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onSubscribeClick={() => setIsSubscriptionModalOpen(true)}
          />
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
    </div>
  );
}