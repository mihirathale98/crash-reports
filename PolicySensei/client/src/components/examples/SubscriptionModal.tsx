import SubscriptionModal from '../SubscriptionModal'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function SubscriptionModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Open Subscription Modal
      </Button>
      <SubscriptionModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  )
}