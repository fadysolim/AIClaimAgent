import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ClaimsList from "@/pages/claims-list";
import ClaimsDashboard from "@/pages/claims-dashboard";
import StaticClaim from "@/pages/static-claim";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ClaimsList} />
      <Route path="/claims/1" component={ClaimsDashboard} />
      <Route path="/claims/:id" component={StaticClaim} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
