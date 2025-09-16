import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const ViolationsPage = () => (
  <div className="space-y-8">
    <h1 className="text-5xl font-extrabold text-foreground text-center">Violations</h1>
    <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
      Detailed reports and statistics on human rights violations worldwide.
    </p>
    <Card className="bg-card border-highlight/20">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Violation Data</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This page will display comprehensive data on various types of violations, their locations, and impact.
        </p>
      </CardContent>
    </Card>
  </div>
)

export default ViolationsPage