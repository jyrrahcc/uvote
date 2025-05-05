
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

/**
 * 404 Not Found page
 */
const NotFound = () => {
  useEffect(() => {
    document.title = "Page Not Found | uVote";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-primary">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold mt-4">Page Not Found</h2>
        <p className="mt-4 text-muted-foreground max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button className="mt-8" asChild>
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
