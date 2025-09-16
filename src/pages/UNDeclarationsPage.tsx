import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { logActivity } from "@/utils/logger"; // Import the new logger
import { useAuth } from "@/context/AuthContext"; // Import useAuth to get currentUser

interface UNDeclaration {
  id: string;
  title: string;
  date: string;
  summary: string;
  link: string;
}

const UNDeclarationsPage = () => {
  const { currentUser } = useAuth(); // Get currentUser for logging
  const { data: declarations, isLoading, error } = useQuery<UNDeclaration[]>({
    queryKey: ['unDeclarations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('un_declarations')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        logActivity(`Error fetching UN declarations: ${error.message}`, 'error', currentUser?.id);
        throw error;
      }
      return data as UNDeclaration[];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-extrabold text-foreground">UN Declarations</h1>
        <p className="text-lg text-muted-foreground">Loading UN declarations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-extrabold text-foreground">UN Declarations</h1>
        <p className="text-lg text-destructive">Error loading UN declarations: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-extrabold text-foreground text-center">UN Declarations</h1>
      <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
        Comprehensive data on United Nations declarations related to conflicts and human rights.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {declarations?.length === 0 ? (
          <p className="text-muted-foreground text-center col-span-full">No UN declarations found. Add some in Supabase!</p>
        ) : (
          declarations?.map((declaration) => (
            <Card key={declaration.id} className="bg-card border-highlight/20 hover:border-highlight transition-colors flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">{declaration.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{new Date(declaration.date).toLocaleDateString()}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground line-clamp-3">{declaration.summary}</p>
                {declaration.link && (
                  <a
                    href={declaration.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-highlight hover:underline text-sm mt-2 inline-block"
                  >
                    Read More
                  </a>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default UNDeclarationsPage