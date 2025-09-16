import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const UNDeclarationsPage = () => (
  <div className="space-y-8">
    <h1 className="text-5xl font-extrabold text-foreground">UN Declarations</h1>
    <Card className="bg-card border-highlight/20">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">UN Declarations Data</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Comprehensive data on United Nations declarations related to conflicts and human rights.
        </p>
      </CardContent>
    </Card>
  </div>
)

export default UNDeclarationsPage