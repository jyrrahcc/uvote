import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import ElectionCard from "@/features/elections/components/ElectionCard";
import { Election } from "@/types";
import { ArrowRight, Check, Search, ShieldCheck, Vote, Award, TrendingUp, Clock, UserCheck } from "lucide-react";

// Sample featured elections
const featuredElections: Election[] = [
  {
    id: "2",
    title: "Community Board Election",
    description: "Select the members who will represent your community interests for the next term.",
    startDate: "2025-05-01T00:00:00Z",
    endDate: "2025-05-15T23:59:59Z",
    status: "active",
    createdBy: "admin-2",
    createdAt: "2025-04-01T00:00:00Z",
    updatedAt: "2025-04-01T00:00:00Z",
    isPrivate: false,
    accessCode: ""
  },
  {
    id: "1",
    title: "Student Body President",
    description: "Vote for your student body president for the 2025-2026 academic year.",
    startDate: "2025-09-01T00:00:00Z",
    endDate: "2025-09-07T23:59:59Z",
    status: "upcoming",
    createdBy: "admin-1",
    createdAt: "2025-08-01T00:00:00Z",
    updatedAt: "2025-08-01T00:00:00Z",
    isPrivate: false,
    accessCode: ""
  },
];

/**
 * Enhanced home page component for the main landing page
 */
const Index = () => {
  return (
    <PageLayout>
      {/* Hero section with improved design */}
      <section className="relative bg-gradient-to-br from-primary/90 to-primary/70 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 bg-[length:20px_20px]"></div>
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-white animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                Your Voice Matters <span className="text-secondary-foreground font-extrabold">Every Vote Counts</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl max-w-xl text-white/90">
                Experience secure, transparent voting with uVote. Create elections, invite voters, 
                and see real-time results with our trusted platform.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 group" asChild>
                  <Link to="/register" className="flex items-center">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  className="bg-[#9b87f5] text-white hover:bg-[#8a70f3] border border-white/20" 
                  asChild
                >
                  <Link to="/how-it-works">
                    Learn How It Works
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:flex justify-end">
              <div className="relative">
                <div className="absolute -inset-4 bg-white/20 rounded-full blur-xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
                  <div className="flex justify-center mb-4">
                    <Vote className="h-16 w-16 text-white" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-8 bg-white/30 rounded-lg w-3/4 mx-auto"></div>
                    <div className="h-24 bg-white/20 rounded-lg"></div>
                    <div className="flex justify-end">
                      <div className="h-10 bg-white/30 rounded-lg w-1/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="fill-background">
            <path d="M0,0 C480,100 960,100 1440,0 L1440,100 L0,100 Z"></path>
          </svg>
        </div>
      </section>

      {/* Features section with more exciting design */}
      <section className="py-20 px-4 overflow-hidden">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
              Why Choose <span className="text-primary">uVote</span>?
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full"></div>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform offers everything you need for secure and transparent elections
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <ShieldCheck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Voting</h3>
              <p className="text-muted-foreground">
                Bank-level encryption ensures your vote remains secure and tamper-proof.
              </p>
            </div>
            
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Search className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Transparent Process</h3>
              <p className="text-muted-foreground">
                Full transparency in the voting process while maintaining voter privacy.
              </p>
            </div>
            
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <UserCheck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy to Use</h3>
              <p className="text-muted-foreground">
                Create elections, invite voters, and view results with our intuitive interface.
              </p>
            </div>
            
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Results</h3>
              <p className="text-muted-foreground">
                Watch results update in real-time as votes are cast and counted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Active elections section with improved design */}
      <section className="py-20 px-4 bg-secondary/50 relative">
        <div className="absolute inset-0 bg-grid-primary/5 bg-[length:20px_20px]"></div>
        <div className="container relative mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Elections</h2>
              <p className="text-muted-foreground">Participate in these ongoing and upcoming elections</p>
            </div>
            <Button variant="outline" className="mt-4 md:mt-0 group" asChild>
              <Link to="/elections" className="flex items-center">
                View All Elections
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredElections.map((election, index) => (
              <div key={election.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <ElectionCard election={election} />
              </div>
            ))}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col justify-center items-center text-center">
              <Award className="h-16 w-16 text-primary/60 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Create Your Own Election</h3>
              <p className="text-muted-foreground mb-6">
                Start your democratic process with just a few clicks
              </p>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start creating and managing elections in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-0.5 bg-primary/30"></div>
            
            <div className="text-center relative">
              <div className="bg-primary h-12 w-12 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-6 relative z-10">1</div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                <h3 className="text-xl font-semibold mb-4">Create an Account</h3>
                <p className="text-muted-foreground mb-4">
                  Sign up and set up your profile to get started with uVote.
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/register">Register Now</Link>
                </Button>
              </div>
            </div>
            
            <div className="text-center relative mt-8 md:mt-0">
              <div className="bg-primary h-12 w-12 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-6 relative z-10">2</div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                <h3 className="text-xl font-semibold mb-4">Set Up Your Election</h3>
                <p className="text-muted-foreground mb-4">
                  Define candidates, voting periods, and access settings.
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/how-it-works">Learn More</Link>
                </Button>
              </div>
            </div>
            
            <div className="text-center relative mt-8 md:mt-0">
              <div className="bg-primary h-12 w-12 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-6 relative z-10">3</div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                <h3 className="text-xl font-semibold mb-4">Invite Voters & Launch</h3>
                <p className="text-muted-foreground mb-4">
                  Share your election with voters and monitor results.
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/how-it-works">View Details</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section with improved design */}
      <section className="py-16 px-4 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMxLjIgMCAyLjEuOSAyLjEgMi4xdjE5LjhjMCAxLjItLjkgMi4xLTIuMSAyLjFIMjRjLTEuMiAwLTIuMS0uOS0yLjEtMi4xVjIwLjFjMC0xLjIuOS0yLjEgMi4xLTIuMWgxMnptMCAyLjFIMjR2MTkuOGgxMlYyMC4xeiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48Y2lyY2xlIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgY3g9IjMwIiBjeT0iMzYiIHI9IjIuMSIvPjwvZz48L3N2Zz4=')]"></div>
        <div className="container relative mx-auto text-center text-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Voting Experience?</h2>
            <p className="text-lg md:text-xl opacity-90 mb-10">
              Join thousands of organizations using uVote for secure, transparent elections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
                <Link to="/register">Create Your Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold">50+</p>
                <p className="text-sm opacity-70">Elections Hosted</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">10k+</p>
                <p className="text-sm opacity-70">Secure Votes</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">100%</p>
                <p className="text-sm opacity-70">Transparency</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">24/7</p>
                <p className="text-sm opacity-70">Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Index;
