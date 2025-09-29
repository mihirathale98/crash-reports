import { Shield, Heart, Users } from "lucide-react";

export type Agency = "all" | "Massachusetts State Police" | "Department of Public Health" | "MassHealth" | "Massachusetts Bay Transportation Authority (MBTA)";

export interface AgencyInfo {
  id: Agency;
  name: string;
  count: number;
  icon: any;
  color: string;
}

export function getAgencies(reports: any[] = []): AgencyInfo[] {
  // Calculate counts from actual reports
  const countByAgency: { [key: string]: number } = {};
  reports.forEach(report => {
    const agency = report.agency;
    countByAgency[agency] = (countByAgency[agency] || 0) + 1;
  });

  const totalCount = reports.length;

  return [
    {
      id: "all",
      name: "All Agencies",
      count: totalCount,
      icon: Users,
      color: "bg-gray-600"
    },
    {
      id: "Massachusetts State Police",
      name: "Massachusetts State Police",
      count: countByAgency["Massachusetts State Police"] || 0,
      icon: Shield,
      color: "bg-blue-600"
    },
    {
      id: "Department of Public Health",
      name: "Department of Public Health",
      count: countByAgency["Department of Public Health"] || 0,
      icon: Heart,
      color: "bg-green-600"
    },
    {
      id: "MassHealth",
      name: "MassHealth",
      count: countByAgency["MassHealth"] || 0,
      icon: Heart,
      color: "bg-purple-600"
    },
    {
      id: "Massachusetts Bay Transportation Authority (MBTA)",
      name: "Massachusetts Bay Transportation Authority (MBTA)",
      count: countByAgency["Massachusetts Bay Transportation Authority (MBTA)"] || 0,
      icon: Users,
      color: "bg-indigo-600"
    }
  ];
}

export function getFilteredInsights(agency: Agency, sentiment?: string) {
  // This will be replaced by actual API calls to BigQuery
  return [];
}

export function getSentimentCounts(reports: any[]) {
  const counts = {
    positive: 0,
    negative: 0,
    neutral: 0
  };

  reports.forEach(report => {
    const sentiment = report?.sentiment;
    if (sentiment === 'positive') {
      counts.positive++;
    } else if (sentiment === 'negative') {
      counts.negative++;
    } else if (sentiment === 'neutral') {
      counts.neutral++;
    }
  });

  return counts;
}

export function getMonthNames() {
  return {
    "1": "January", "2": "February", "3": "March", "4": "April",
    "5": "May", "6": "June", "7": "July", "8": "August",
    "9": "September", "10": "October", "11": "November", "12": "December"
  };
}

export function getAgencyDisplayName(agencyId: string): string {
  if (agencyId === "all") {
    return "All Agencies";
  }
  // Since we're now using actual agency names as IDs, just return the ID directly
  return agencyId;
}

export function getUILabels() {
  return {
    filterByAgency: {
      title: "Filter by Agency",
      description: "Select an agency to view their reports"
    },
    policyInsightsReport: {
      title: "Government Reports Dashboard",
      subscribeButton: "Subscribe to Updates",
      subscribeButtonShort: "Subscribe"
    },
    topInsights: {
      title: "Recent Reports",
      lastUpdated: "Last updated: Just now",
      noInsightsTitle: "No reports available",
      noInsightsDescription: "No reports found for the selected filters. Try selecting a different agency or time period."
    }
  };
}

export function getAppMetadata() {
  return {
    title: "PolicySensei",
    description: "Government Report Dashboard",
    dataSources: ["Reddit API", "Public Data"],
    updateFrequency: "Updated daily"
  };
}