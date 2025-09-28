# Government Feedback Dashboard

A beautiful Next.js dashboard for viewing and analyzing government agency feedback reports from Reddit data stored in BigQuery.

## Features

- 📊 Interactive dashboard with agency, month, and year filters
- 📋 Beautiful markdown report viewer with custom styling
- 🔍 Preview of recent reports from BigQuery database
- 📱 Responsive design that works on all devices
- ⚡ Fast loading with Next.js 14 and server-side rendering
- 🎨 Beautiful UI with Tailwind CSS and custom components

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Database**: Google BigQuery
- **Deployment**: Vercel
- **Language**: TypeScript
- **Markdown**: React Markdown

## Getting Started

### Prerequisites

- Node.js 18+
- Google Cloud Project with BigQuery enabled
- Service account JSON file with BigQuery access

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd crash-reports/frontend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` and add your Google Cloud configuration:
\`\`\`
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account.json
\`\`\`

4. Place your service account JSON file in the frontend directory

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

\`\`\`
frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── reports/         # API routes for BigQuery
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Main dashboard page
│   ├── components/
│   │   ├── ui/                  # Reusable UI components
│   │   ├── dashboard-filters.tsx # Filter controls
│   │   ├── markdown-viewer.tsx  # Report viewer
│   │   └── report-previews.tsx  # Recent reports
│   ├── lib/
│   │   ├── bigquery.ts          # BigQuery integration
│   │   └── utils.ts             # Utility functions
│   └── types/
│       └── index.ts             # TypeScript types
├── package.json
├── tailwind.config.js
├── next.config.js
└── vercel.json                  # Vercel deployment config
\`\`\`

## API Endpoints

- \`GET /api/reports\` - Fetch reports with optional filters (agency, month, year)
- \`GET /api/reports/recent\` - Fetch recent reports for previews

## Deployment to Vercel

### Option 1: Automatic Deployment

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add environment variables in Vercel dashboard:
   - \`GOOGLE_CLOUD_PROJECT\`
   - \`GOOGLE_APPLICATION_CREDENTIALS\` (paste JSON content)
4. Deploy!

### Option 2: Manual Deployment

1. Install Vercel CLI:
\`\`\`bash
npm i -g vercel
\`\`\`

2. Login to Vercel:
\`\`\`bash
vercel login
\`\`\`

3. Deploy:
\`\`\`bash
vercel --prod
\`\`\`

4. Set environment variables:
\`\`\`bash
vercel env add GOOGLE_CLOUD_PROJECT
vercel env add GOOGLE_APPLICATION_CREDENTIALS
\`\`\`

## BigQuery Schema

The dashboard expects a BigQuery table with the following schema:

\`\`\`sql
CREATE TABLE \`your-project.bostonreports.boston-reports\` (
  agency STRING,
  month INT64,
  year INT64,
  report STRING
);
\`\`\`

## Customization

### Adding New Agencies

Edit \`src/components/dashboard-filters.tsx\` and add to the \`AGENCIES\` array:

\`\`\`typescript
const AGENCIES: AgencyOption[] = [
  { value: 'Your Agency Name', label: 'Display Name' },
  // ... existing agencies
]
\`\`\`

### Styling

The dashboard uses Tailwind CSS with a custom color scheme. Modify \`src/app/globals.css\` to change the color palette.

### BigQuery Configuration

Update \`src/lib/bigquery.ts\` to change the dataset and table names:

\`\`\`typescript
const DATASET_ID = 'your-dataset'
const TABLE_ID = 'your-table'
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.