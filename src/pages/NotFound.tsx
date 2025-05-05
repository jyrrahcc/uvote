
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Search } from "lucide-react";

/**
 * Enhanced 404 Not Found page
 */
const NotFound = () => {
  useEffect(() => {
    document.title = "Page Not Found | uVote";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="text-8xl md:text-9xl font-bold text-primary">404</div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-4 shadow-lg">
              <Search className="h-10 w-10 text-primary" />
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-semibold mt-8">Page Not Found</h2>
        <p className="mt-4 text-muted-foreground max-w-md mx-auto mb-8">
          The page you are looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/">Return to Home</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/elections">Browse Elections</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
