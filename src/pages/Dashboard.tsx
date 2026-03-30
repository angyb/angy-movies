import AppNav from "@/components/AppNav";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground mb-8">
          Data visualizations powered by D3.js — add charts below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-border bg-card p-6 flex items-center justify-center min-h-[300px]">
            <p className="text-muted-foreground text-sm">Chart placeholder — add your first D3 visualization here</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 flex items-center justify-center min-h-[300px]">
            <p className="text-muted-foreground text-sm">Chart placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
