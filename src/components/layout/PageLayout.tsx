
import Navbar from "./Navbar";
import Footer from "./Footer";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard page layout with navbar, content area, and footer
 */
const PageLayout = ({ children, className = "" }: PageLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className={`flex-grow pt-16 ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
