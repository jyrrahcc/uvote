
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Vote, LogOut, BarChart3, ChevronDown } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Logo from "./Logo";

/**
 * Enhanced main navigation bar component
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useRole();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };
  
  // Helper to get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  // Check if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-sm shadow-sm" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <Logo size="medium" />
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link 
                    to="/" 
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      isActive('/') 
                        ? "text-primary" 
                        : "text-foreground hover:text-primary"
                    }`}
                  >
                    Home
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link 
                    to="/elections" 
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      isActive('/elections') 
                        ? "text-primary" 
                        : "text-foreground hover:text-primary"
                    }`}
                  >
                    Elections
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    Resources
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 w-[220px]">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/how-it-works"
                            className={cn(
                              "flex items-center space-x-2 rounded-md p-2 hover:bg-accent",
                              isActive('/how-it-works') && "bg-accent"
                            )}
                          >
                            <div>
                              <div className="text-sm font-medium">How It Works</div>
                              <p className="text-xs text-muted-foreground">
                                Learn about our platform
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/about"
                            className={cn(
                              "flex items-center space-x-2 rounded-md p-2 hover:bg-accent",
                              isActive('/about') && "bg-accent"
                            )}
                          >
                            <div>
                              <div className="text-sm font-medium">About Us</div>
                              <p className="text-xs text-muted-foreground">
                                Meet our team
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/faq"
                            className={cn(
                              "flex items-center space-x-2 rounded-md p-2 hover:bg-accent"
                            )}
                          >
                            <div>
                              <div className="text-sm font-medium">FAQs</div>
                              <p className="text-xs text-muted-foreground">
                                Common questions answered
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/security"
                            className={cn(
                              "flex items-center space-x-2 rounded-md p-2 hover:bg-accent"
                            )}
                          >
                            <div>
                              <div className="text-sm font-medium">Security</div>
                              <p className="text-xs text-muted-foreground">
                                Our security measures
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                {user && (
                  <NavigationMenuItem>
                    <Link 
                      to="/dashboard" 
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        isActive('/dashboard') 
                          ? "text-primary" 
                          : "text-foreground hover:text-primary"
                      }`}
                    >
                      Dashboard
                    </Link>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* Authentication buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/elections">
                      <BarChart3 className="mr-1.5 h-4 w-4" />
                      Admin
                    </Link>
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <NavigationMenu>
                      <NavigationMenuList>
                        <NavigationMenuItem>
                          <NavigationMenuTrigger className="h-auto px-2 py-0.5 -ml-2">
                            <span className="text-sm">My Account</span>
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <ul className="grid w-[180px] gap-1 p-2">
                              <li>
                                <NavigationMenuLink asChild>
                                  <Link
                                    to="/profile"
                                    className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                                  >
                                    <User className="h-4 w-4" />
                                    <span>Profile</span>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                              <li>
                                <NavigationMenuLink asChild>
                                  <Link
                                    to="/my-votes"
                                    className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                                  >
                                    <Vote className="h-4 w-4" />
                                    <span>My Votes</span>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                              <li>
                                <button
                                  onClick={handleSignOut}
                                  className="flex w-full items-center gap-2 rounded-md p-2 hover:bg-accent text-left"
                                >
                                  <LogOut className="h-4 w-4" />
                                  <span>Sign Out</span>
                                </button>
                              </li>
                            </ul>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      </NavigationMenuList>
                    </NavigationMenu>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/login" className="font-medium">Log in</Link>
                </Button>
                <Button asChild>
                  <Link to="/register" className="font-medium">Sign Up</Link>
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
        <div className="bg-background px-4 pt-2 pb-3 space-y-1 sm:px-3 shadow-lg animate-fade-in border-t border-border">
          <Link 
            to="/" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/') 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-secondary hover:text-primary-foreground"
            }`}
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/elections" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/elections') 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-secondary hover:text-primary-foreground"
            }`}
            onClick={() => setIsOpen(false)}
          >
            Elections
          </Link>
          <Link 
            to="/how-it-works" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/how-it-works') 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-secondary hover:text-primary-foreground"
            }`}
            onClick={() => setIsOpen(false)}
          >
            How It Works
          </Link>
          <Link 
            to="/about" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/about') 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-secondary hover:text-primary-foreground"
            }`}
            onClick={() => setIsOpen(false)}
          >
            About Us
          </Link>
          {user && (
            <Link 
              to="/dashboard" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/dashboard') 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-secondary hover:text-primary-foreground"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
          )}
          {isAdmin && user && (
            <Link 
              to="/admin/elections" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/admin/elections') 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-secondary hover:text-primary-foreground"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Admin Panel
            </Link>
          )}
          <div className="pt-4 pb-3 border-t border-border">
            <div className="flex flex-col space-y-2 px-3">
              {user ? (
                <>
                  <div className="flex items-center px-3 py-2">
                    <div className="flex-shrink-0">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium">{user.email}</div>
                    </div>
                  </div>
                  <Button variant="outline" asChild onClick={() => setIsOpen(false)}>
                    <Link to="/profile" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </Button>
                  <Button variant="outline" asChild onClick={() => setIsOpen(false)}>
                    <Link to="/my-votes" className="w-full justify-start">
                      <Vote className="mr-2 h-4 w-4" />
                      My Votes
                    </Link>
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsOpen(false);
                      handleSignOut();
                    }}
                    className="w-full justify-start"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
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
