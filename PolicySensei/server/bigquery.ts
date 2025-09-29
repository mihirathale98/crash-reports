import { BigQuery } from '@google-cloud/bigquery';

function resolveGoogleCredentials(): { client_email: string; private_key: string } | undefined {
  try {
    // 1) Full JSON as env (plain JSON)
    if (process.env.GOOGLE_CREDENTIALS) {
      const json = JSON.parse(process.env.GOOGLE_CREDENTIALS as string);
      if (json.client_email && json.private_key) {
        return {
          client_email: json.client_email,
          private_key: String(json.private_key),
        };
      }
    }

    // 2) Full JSON as env (base64)
    if (process.env.GOOGLE_CREDENTIALS_BASE64) {
      const decoded = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf8');
      const json = JSON.parse(decoded);
      if (json.client_email && json.private_key) {
        return {
          client_email: json.client_email,
          private_key: String(json.private_key),
        };
      }
    }

    // 3) Separate email + key envs (key may be PEM, escaped PEM, or base64)
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || process.env.GCP_PRIVATE_KEY;

    if (clientEmail && privateKey) {
      // Remove wrapping quotes if present
      if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith('\'') && privateKey.endsWith('\''))) {
        privateKey = privateKey.substring(1, privateKey.length - 1);
      }

      // If base64, decode to UTF-8
      const maybeDecoded = (() => {
        try {
          const decoded = Buffer.from(privateKey as string, 'base64').toString('utf8');
          return decoded.includes('BEGIN') && decoded.includes('PRIVATE KEY') ? decoded : null;
        } catch {
          return null;
        }
      })();

      let normalized = maybeDecoded || (privateKey as string);

      // Replace escaped newlines with real newlines
      normalized = normalized.replace(/\\n/g, '\n');

      return {
        client_email: clientEmail,
        private_key: normalized,
      };
    }
  } catch {
    // Fall through to ADC
  }

  // 4) Nothing usable provided -> let ADC handle it
  return undefined;
}

// Initialize BigQuery client
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'sundai-club-434220',
  credentials: resolveGoogleCredentials(),
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