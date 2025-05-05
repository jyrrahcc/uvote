
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";

/**
 * Main navigation bar component
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-primary font-bold text-xl">u</span>
              <span className="text-2xl font-bold">Vote</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/elections" className="text-foreground hover:text-primary transition-colors">
              Elections
            </Link>
            <Link to="/how-it-works" className="text-foreground hover:text-primary transition-colors">
              How It Works
            </Link>
            {user && (
              <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
            )}
          </nav>

          {/* Authentication buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="outline" asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </Button>
                <Button onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`md:hidden ${isOpen ? "block" : "hidden"}`}>
        <div className="bg-background px-4 pt-2 pb-3 space-y-1 sm:px-3 shadow-lg animate-fade-in">
          <Link 
            to="/" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-secondary hover:text-primary-foreground"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/elections" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-secondary hover:text-primary-foreground"
            onClick={() => setIsOpen(false)}
          >
            Elections
          </Link>
          <Link 
            to="/how-it-works" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-secondary hover:text-primary-foreground"
            onClick={() => setIsOpen(false)}
          >
            How It Works
          </Link>
          {user && (
            <Link 
              to="/dashboard" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-secondary hover:text-primary-foreground"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
          )}
          <div className="pt-4 pb-3 border-t border-border">
            <div className="flex flex-col space-y-2 px-3">
              {user ? (
                <>
                  <Button variant="outline" asChild onClick={() => setIsOpen(false)}>
                    <Link to="/profile">Profile</Link>
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsOpen(false);
                      handleSignOut();
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full" onClick={() => setIsOpen(false)}>
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
                    <Link to="/register">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
