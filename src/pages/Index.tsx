
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import ElectionCard from "@/features/elections/components/ElectionCard";
import { Election } from "@/types";
import { ArrowRight, Check, Search, ShieldCheck } from "lucide-react";

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
    isPrivate: false
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
    isPrivate: false
  },
];

/**
 * Home page component for the main landing page
 */
const Index = () => {
  return (
    <PageLayout>
      {/* Hero section */}
      <section className="bg-gradient-to-b from-secondary to-background py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            Secure, Transparent <span className="text-primary">Voting</span>
          </h1>
          <p className="mt-6 text-xl md:text-2xl max-w-3xl mx-auto text-muted-foreground">
            Create and manage elections, vote securely, and get real-time results with our trusted platform.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/register">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/how-it-works">
                Learn How It Works
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose uVote?</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ShieldCheck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Voting</h3>
              <p className="text-muted-foreground">
                Bank-level encryption ensures that your vote remains secure and tamper-proof.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Search className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Transparent Process</h3>
              <p className="text-muted-foreground">
                Full transparency in the voting process while maintaining voter privacy.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Check className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy to Use</h3>
              <p className="text-muted-foreground">
                Create elections, invite voters, and view results with our intuitive interface.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Active elections section */}
      <section className="py-16 px-4 bg-secondary">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Active Elections</h2>
            <Button variant="outline" asChild>
              <Link to="/elections">
                View All Elections
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredElections.map((election) => (
              <ElectionCard key={election.id} election={election} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Started?</h2>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto opacity-90">
            Join thousands of organizations using uVote for secure, transparent elections.
          </p>
          <div className="mt-10">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">Create Your First Election</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Index;
