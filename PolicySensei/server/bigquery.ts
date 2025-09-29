import { BigQuery } from '@google-cloud/bigquery';

// Initialize BigQuery client
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'sundai-club-434220',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './sundai-club-434220-8c96234b132c.json',
});

const DATASET_ID = process.env.BIGQUERY_DATASET || 'bostonreports';
const TABLE_ID = process.env.BIGQUERY_TABLE || 'boston-reports';

export interface Report {
  agency: string;
  month: string;
  year: string;
  report: string;
  summary?: any; // Parsed JSON summary
}

export async function getReports(
  agency?: string,
  month?: number,
  year?: number
): Promise<Report[]> {
  try {
    let query = `
      SELECT agency, month, year, report,
             IFNULL(summary, NULL) as summary
      FROM \`${bigquery.projectId}.${DATASET_ID}.${TABLE_ID}\`
    `;

    const conditions: string[] = [];
    const parameters: any = {};

    if (agency) {
      conditions.push('agency = @agency');
      parameters.agency = agency;
    }

    if (month) {
      conditions.push('month = @month');
      parameters.month = month.toString();
    }

    if (year) {
      conditions.push('year = @year');
      parameters.year = year.toString();
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY year DESC, month DESC, agency';

    const options = {
      query,
      params: parameters,
    };

    const [rows] = await bigquery.query(options);

    console.log('BigQuery raw response sample:', JSON.stringify(rows[0], null, 2)); // Debug log

    return rows
      .map((row: any) => {
        let summary = null;

        // Handle cases where summary field exists and has data
        if (row.summary !== undefined && row.summary !== null && row.summary !== '') {
          try {
            summary = JSON.parse(row.summary);
            console.log('Successfully parsed summary for', row.agency);
          } catch (e) {
            console.error('Failed to parse summary JSON for', row.agency, ':', e);
            summary = null;
          }
        } else {
          console.log('No summary data for', row.agency, '- summary field:', row.summary);
        }

        return {
          agency: row.agency,
          month: row.month,
          year: row.year,
          report: row.report,
          summary: summary,
        };
      })
      .filter((report) => {
        // Only include records that have summary with title
        return report.summary && report.summary.title;
      });
  } catch (error) {
    console.error('Error fetching reports from BigQuery:', error);
    throw new Error('Failed to fetch reports');
  }
}

export async function getRecentReports(limit: number = 10): Promise<Report[]> {
  try {
    const query = `
      SELECT agency, month, year, report,
             IFNULL(summary, NULL) as summary
      FROM \`${bigquery.projectId}.${DATASET_ID}.${TABLE_ID}\`
      ORDER BY year DESC, month DESC, agency
      LIMIT @limit
    `;

    const options = {
      query,
      params: { limit },
    };

    const [rows] = await bigquery.query(options);

    return rows.map((row: any) => {
      let summary = null;

      // Handle cases where summary field exists and has data
      if (row.summary !== undefined && row.summary !== null && row.summary !== '') {
        try {
          summary = JSON.parse(row.summary);
        } catch (e) {
          console.error('Failed to parse summary JSON for', row.agency, ':', e);
          summary = null;
        }
      }

      return {
        agency: row.agency,
        month: row.month,
        year: row.year,
        report: row.report,
        summary: summary,
      };
    });
  } catch (error) {
    console.error('Error fetching recent reports from BigQuery:', error);
    throw new Error('Failed to fetch recent reports');
  }
}