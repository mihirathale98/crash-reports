import { NextRequest, NextResponse } from 'next/server'
import { getRecentReports } from '@/lib/bigquery'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10

    const reports = await getRecentReports(limit)

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent reports' },
      { status: 500 }
    )
  }
}