import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ElectionCard from "@/features/elections/components/ElectionCard";

const Index = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#008f50] to-[#007a45] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold mb-6">
                Your Voice, Your Vote, Our Future.
              </h1>
              <p className="text-lg mb-8">
                Participate in the democratic process and shape the future of our community.
                Browse active elections, learn about candidates, and cast your vote.
              </p>
              <Button asChild className="bg-white text-[#008f50] hover:bg-gray-100">
                <Link to="/elections">
                  View Elections <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
            <div>
              <img
                src="/hero-image.svg"
                alt="Voting Illustration"
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Elections Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Current Elections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ElectionCard
            election={{
              id: "1",
              title: "Student Council Elections 2023",
              description: "Vote for your student council representatives",
              startDate: "2023-05-01T00:00:00Z",
              endDate: "2023-05-15T23:59:59Z",
              status: "active",
              createdBy: "admin",
              createdAt: "2023-04-15T00:00:00Z",
              updatedAt: "2023-04-15T00:00:00Z",
              isPrivate: false,
              accessCode: "1234",
              colleges: [], 
              restrictVoting: false,
              eligibleYearLevels: []
            }}
            isAccessVerified={true}
          />
          <ElectionCard
            election={{
              id: "2",
              title: "Department Chair Election",
              description: "Choose your next department chairperson",
              startDate: "2023-05-20T00:00:00Z",
              endDate: "2023-05-30T23:59:59Z",
              status: "upcoming",
              createdBy: "admin",
              createdAt: "2023-04-15T00:00:00Z",
              updatedAt: "2023-04-15T00:00:00Z",
              isPrivate: false,
              accessCode: "5678",
              colleges: [],
              restrictVoting: false,
              eligibleYearLevels: []
            }}
            isAccessVerified={true}
          />
          <ElectionCard
            election={{
              id: "3",
              title: "Club President Election",
              description: "Vote for your club president",
              startDate: "2023-04-10T00:00:00Z",
              endDate: "2023-04-20T23:59:59Z",
              status: "completed",
              createdBy: "admin",
              createdAt: "2023-04-01T00:00:00Z",
              updatedAt: "2023-04-01T00:00:00Z",
              isPrivate: true,
              accessCode: "abcd",
              colleges: [],
              restrictVoting: false,
              eligibleYearLevels: []
            }}
            isAccessVerified={false}
          />
        </div>
      </div>

      {/* How to Vote Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">How to Vote</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <img
                src="/step1.svg"
                alt="Register to Vote"
                className="mx-auto mb-4 h-24"
              />
              <h3 className="text-xl font-semibold mb-2">Register to Vote</h3>
              <p className="text-gray-600">
                Create an account or log in to our platform to get started.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <img
                src="/step2.svg"
                alt="Browse Elections"
                className="mx-auto mb-4 h-24"
              />
              <h3 className="text-xl font-semibold mb-2">Browse Elections</h3>
              <p className="text-gray-600">
                Explore the available elections and learn about the candidates.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <img
                src="/step3.svg"
                alt="Cast Your Vote"
                className="mx-auto mb-4 h-24"
              />
              <h3 className="text-xl font-semibold mb-2">Cast Your Vote</h3>
              <p className="text-gray-600">
                Select your preferred candidates and submit your vote securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 DLSU-D Online Voting System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
