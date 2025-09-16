import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  className?: string;
  iconClassName?: string;
  valueClassName?: string;
  labelClassName?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  value,
  label,
  className,
  iconClassName,
  valueClassName,
  labelClassName,
}) => {
  return (
    <Card className={cn("bg-card border-highlight/20 hover:border-highlight transition-colors", className)}>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className={cn("text-highlight text-4xl mb-2", iconClassName)}>{icon}</div>
        <div className={cn("text-4xl font-bold text-foreground mb-1", valueClassName)}>{value}</div>
        <p className={cn("text-muted-foreground text-sm", labelClassName)}>{label}</p>
      </CardContent>
    </Card>
  );
};

export default MetricCard;