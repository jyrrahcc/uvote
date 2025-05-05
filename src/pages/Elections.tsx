
import PageLayout from "@/components/layout/PageLayout";
import ElectionsList from "@/features/elections/components/ElectionsList";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

/**
 * Elections listing page component
 */
const Elections = () => {
  return (
    <PageLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Elections</h1>
          <Button asChild className="mt-4 md:mt-0">
            <Link to="/elections/create">
              <Plus className="mr-2 h-4 w-4" />
              Create New Election
            </Link>
          </Button>
        </div>
        
        <ElectionsList />
      </div>
    </PageLayout>
  );
};

export default Elections;
