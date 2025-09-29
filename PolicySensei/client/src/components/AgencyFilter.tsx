import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getAgencies, getUILabels, type Agency } from "@/lib/dataService";

interface AgencyFilterProps {
  selectedAgency: Agency;
  onAgencyChange: (agency: Agency) => void;
  reports?: any[];
}

export default function AgencyFilter({ selectedAgency, onAgencyChange, reports = [] }: AgencyFilterProps) {
  const agencies = getAgencies(reports);
  const uiLabels = getUILabels();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{uiLabels.filterByAgency.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {uiLabels.filterByAgency.description}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {agencies.map((agency) => {
          const Icon = agency.icon;
          const isSelected = selectedAgency === agency.id;
          
          return (
            <div
              key={agency.id}
              role="button"
              tabIndex={0}
              className={cn(
                "w-full p-4 rounded-md cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 relative",
                isSelected 
                  ? "bg-primary text-primary-foreground" 
                  : "hover-elevate active-elevate-2"
              )}
              onClick={() => onAgencyChange(agency.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onAgencyChange(agency.id);
                }
              }}
              aria-pressed={isSelected}
              data-testid={`button-filter-${agency.id}`}
            >
              <div className="flex items-baseline gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 translate-y-[-2px]",
                  agency.color
                )}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "font-medium truncate text-sm leading-5",
                    isSelected ? "text-primary-foreground" : "text-foreground"
                  )}>
                    {agency.name}
                  </div>
                  <div className={cn(
                    "text-xs truncate leading-4 -mt-0.5",
                    isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    {agency.count} insights this month
                  </div>
                </div>
                <Badge 
                  variant={isSelected ? "outline" : "secondary"} 
                  className={cn(
                    "flex-shrink-0 translate-y-[-2px]",
                    isSelected && "border-primary-foreground/20 text-primary-foreground"
                  )}
                >
                  {agency.count}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}