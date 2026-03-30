import { NavLink } from "@/components/NavLink";
import { LayoutList, BarChart3 } from "lucide-react";

const AppNav = () => {
  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto flex items-center gap-1 px-4 py-2">
        <h1 className="font-bold text-lg text-foreground mr-6">🎬 Angy's Movies</h1>
        <NavLink
          to="/"
          end
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          activeClassName="bg-primary/10 text-primary"
        >
          <LayoutList className="h-4 w-4" />
          Movie List
        </NavLink>
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          activeClassName="bg-primary/10 text-primary"
        >
          <BarChart3 className="h-4 w-4" />
          Dashboard
        </NavLink>
      </div>
    </nav>
  );
};

export default AppNav;
