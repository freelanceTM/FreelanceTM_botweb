import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";

// Pages
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import ServiceDetail from "@/pages/ServiceDetail";
import Services from "@/pages/Services";
import Categories from "@/pages/Categories";
import CreateService from "@/pages/CreateService";
import MyServices from "@/pages/MyServices";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import Messages from "@/pages/Messages";
import Balance from "@/pages/Balance";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated && <Header />}
      <main className="flex-1">
        <Switch>
          {isLoading || !isAuthenticated ? (
            <Route path="/" component={Landing} />
          ) : (
            <>
              <Route path="/" component={Home} />
              <Route path="/services" component={Services} />
              <Route path="/services/create" component={CreateService} />
              <Route path="/services/:id" component={ServiceDetail} />
              <Route path="/my-services" component={MyServices} />
              <Route path="/categories" component={Categories} />
              <Route path="/categories/:slug" component={Services} />
              <Route path="/orders" component={Orders} />
              <Route path="/orders/:id" component={OrderDetail} />
              <Route path="/messages" component={Messages} />
              <Route path="/balance" component={Balance} />
              <Route path="/profile" component={Profile} />
              <Route path="/admin" component={Admin} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <Toaster />
          <Router />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
