import AppNav from "@/components/AppNav";
import BudgetYearChart from "@/components/BudgetYearChart";
import BudgetTreemap from "@/components/BudgetTreemap";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("movies").select("*").order("rank", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const budgetData = movies
    .filter((m) => m.budget != null && m.budget > 0)
    .map((m) => ({ name: m.name, year: m.year, budget: m.budget!, genre: m.genre }));

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground mb-8">
          Data visualizations powered by D3.js.
        </p>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Movie Budgets by Year</h3>
          {isLoading ? (
            <Skeleton className="w-full h-[500px]" />
          ) : budgetData.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-20">No budget data available.</p>
          ) : (
            <BudgetYearChart data={budgetData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
