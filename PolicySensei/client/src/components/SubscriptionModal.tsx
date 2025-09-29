import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [email, setEmail] = useState("");
  const [agencies, setAgencies] = useState({
    hhs: true,
    rmv: true,
    general: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // todo: remove mock functionality
    console.log('Subscribing with:', { email, agencies });
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      alert('Successfully subscribed to monthly policy insights!');
    }, 1000);
  };

  const handleAgencyChange = (agency: keyof typeof agencies) => {
    setAgencies(prev => ({
      ...prev,
      [agency]: !prev[agency]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
            Subscribe to Monthly Insights
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Receive curated policy insights from Reddit discussions delivered to your inbox monthly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm sm:text-base">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@mass.gov"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-subscription-email"
              className="h-10 sm:h-11 text-sm sm:text-base"
            />
          </div>

          <div className="space-y-3 sm:space-y-4">
            <Label className="text-sm sm:text-base">Subscribe to agencies:</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="hhs"
                  checked={agencies.hhs}
                  onCheckedChange={() => handleAgencyChange('hhs')}
                  data-testid="checkbox-hhs"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <Label htmlFor="hhs" className="text-sm sm:text-base cursor-pointer flex-1">
                  Health & Human Services
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="rmv"
                  checked={agencies.rmv}
                  onCheckedChange={() => handleAgencyChange('rmv')}
                  data-testid="checkbox-rmv"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <Label htmlFor="rmv" className="text-sm sm:text-base cursor-pointer flex-1">
                  Registry of Motor Vehicles
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="general"
                  checked={agencies.general}
                  onCheckedChange={() => handleAgencyChange('general')}
                  data-testid="checkbox-general"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <Label htmlFor="general" className="text-sm sm:text-base cursor-pointer flex-1">
                  General State Functions
                </Label>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel-subscription"
              className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!email || isSubmitting}
              data-testid="button-submit-subscription"
              className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base"
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </div>
        </form>

        <div className="text-xs sm:text-sm text-muted-foreground mt-4 pt-4 border-t">
          You'll receive insights on the 1st of each month. Unsubscribe anytime.
        </div>
      </DialogContent>
    </Dialog>
  );
}