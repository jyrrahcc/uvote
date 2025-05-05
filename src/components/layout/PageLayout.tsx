
import { useAuth } from "@/features/auth/context/AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard page layout with navbar, content area, and footer
 */
const PageLayout = ({ children, className = "" }: PageLayoutProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className={`flex-grow ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
