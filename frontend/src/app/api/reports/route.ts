import { NextRequest, NextResponse } from 'next/server'
import { getReports } from '@/lib/bigquery'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agency = searchParams.get('agency') || undefined
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined

    const reports = await getReports(agency, month, year)

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}