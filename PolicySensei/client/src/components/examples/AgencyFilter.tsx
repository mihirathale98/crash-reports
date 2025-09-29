import AgencyFilter from '../AgencyFilter'
import { useState } from 'react'

export default function AgencyFilterExample() {
  const [selectedAgency, setSelectedAgency] = useState<'all' | 'hhs' | 'rmv' | 'general'>('all');
  
  return (
    <AgencyFilter 
      selectedAgency={selectedAgency} 
      onAgencyChange={setSelectedAgency} 
    />
  )
}