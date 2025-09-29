import InsightFeed from '../InsightFeed'

export default function InsightFeedExample() {
  return (
    <InsightFeed 
      selectedAgency="all"
      selectedMonth="11"
      selectedYear="2024"
      onSubscribeClick={() => console.log('Subscribe clicked')}
    />
  )
}