import InsightCard from '../InsightCard'

export default function InsightCardExample() {
  // todo: remove mock functionality
  const mockInsights = [
    {
      id: "1",
      title: "Long wait times at RMV renewal appointments causing frustration",
      summary: "Multiple citizens reporting 2-3 hour wait times for license renewals despite having appointments. Users suggest online renewal options and better appointment scheduling system.",
      sentiment: "negative" as const,
      agency: "RMV",
      sourceUrl: "https://reddit.com/r/massachusetts/comments/example1",
      sourceTitle: "r/massachusetts - RMV appointment disaster",
      postedDate: "Nov 15, 2024",
      engagementCount: 47
    },
    {
      id: "2", 
      title: "Positive feedback on new MassHealth enrollment process",
      summary: "Citizens praising the streamlined online enrollment process for MassHealth. Multiple posts highlight reduced paperwork and faster approval times compared to previous system.",
      sentiment: "positive" as const,
      agency: "HHS",
      sourceUrl: "https://reddit.com/r/boston/comments/example2",
      sourceTitle: "r/boston - MassHealth improvements",
      postedDate: "Nov 12, 2024",
      engagementCount: 23
    }
  ];

  return (
    <div className="space-y-4">
      {mockInsights.map((insight) => (
        <InsightCard key={insight.id} {...insight} />
      ))}
    </div>
  )
}