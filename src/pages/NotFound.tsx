
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Search, Home, HelpCircle, FileText, Mail } from "lucide-react";

/**
 * Enhanced 404 Not Found page with more helpful resources
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

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-border">
            <HelpCircle className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-2">Check our FAQ or contact support</p>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/faq">FAQ</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/contact">Contact</Link>
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-border">
            <FileText className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium">Resources</h3>
            <p className="text-sm text-muted-foreground mb-2">Explore our helpful resources</p>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/how-it-works">How It Works</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/blog">Blog</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <p className="text-sm text-muted-foreground">
            If you continue to experience issues, please <Link to="/contact" className="text-primary hover:underline">contact our support team</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
