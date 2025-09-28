export interface Report {
  agency: string;
  month: number;
  year: number;
  report: string;
}

export interface AgencyOption {
  value: string;
  label: string;
}

export interface ReportPreview {
  agency: string;
  month: number;
  year: number;
  preview: string;
  wordCount: number;
}