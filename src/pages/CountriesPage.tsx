import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const CountriesPage = () => (
  <div className="space-y-8">
    <h1 className="text-5xl font-extrabold text-foreground">Countries</h1>
    <Card className="bg-card border-highlight/20">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Country Data</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Comprehensive data on countries involved in conflicts.
        </p>
      </CardContent>
    </Card>
  </div>
)

export default CountriesPage