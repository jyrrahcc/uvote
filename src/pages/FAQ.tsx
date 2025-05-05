
import PageLayout from "@/components/layout/PageLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useEffect } from "react";

const FAQ = () => {
  useEffect(() => {
    document.title = "Frequently Asked Questions | uVote";
  }, []);

  return (
    <PageLayout>
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-lg mb-10">
          Find answers to common questions about using the uVote platform
        </p>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How does uVote ensure the security of elections?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                uVote employs several security measures to ensure election integrity:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>End-to-end encryption for all data transmission</li>
                <li>Secure user authentication</li>
                <li>Role-based access controls</li>
                <li>Audit logs for all system activities</li>
                <li>Vote verification receipts</li>
                <li>Regular security audits and updates</li>
              </ul>
              <p className="mt-2">
                For more details, please visit our <a href="/security" className="text-primary hover:underline">Security</a> page.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>How do I create a new election?</AccordionTrigger>
            <AccordionContent>
              <p>
                To create a new election, sign in to your account and navigate to the Dashboard. 
                Click on "Create New Election" and follow the step-by-step process to set up your 
                election details, including title, description, voting period, and candidates. 
                You can preview your election before publishing it. Once published, you can share 
                access with voters.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Can I create a private election?</AccordionTrigger>
            <AccordionContent>
              <p>
                Yes, uVote supports private elections. When creating your election, select the 
                "Private Election" option and set an access code. Only people with the access 
                code will be able to participate in the election. This is useful for 
                organization-specific elections where you want to limit voter participation.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>How do voters cast their votes?</AccordionTrigger>
            <AccordionContent>
              <p>
                Voters need to create an account or sign in to their existing account. Then, they 
                can access the election (using an access code if it's a private election), review 
                the candidates, and cast their vote. The system ensures that each voter can only 
                vote once per election, and voters receive a confirmation once their vote is recorded.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>Can I modify an election after it has started?</AccordionTrigger>
            <AccordionContent>
              <p>
                For election integrity, certain aspects of an election cannot be modified after 
                voting has begun. This includes adding or removing candidates and changing core 
                election settings. However, you can still update descriptions or other non-critical 
                information. If you need to make substantial changes, we recommend ending the 
                current election and creating a new one.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>How are results calculated and displayed?</AccordionTrigger>
            <AccordionContent>
              <p>
                Results are calculated automatically as votes are cast. For ongoing elections, 
                results update in real-time. After an election ends, final results are available 
                on the results page, showing vote counts and percentages for each candidate. 
                Administrators can also export detailed results data for further analysis.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger>Is there a limit to how many elections I can create?</AccordionTrigger>
            <AccordionContent>
              <p>
                Our standard plan allows for an unlimited number of elections, with reasonable 
                usage limits on the number of voters and candidates per election. For large-scale 
                elections with thousands of voters, please contact our support team to discuss 
                enterprise options tailored to your needs.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger>How long are election results stored?</AccordionTrigger>
            <AccordionContent>
              <p>
                Election results are stored indefinitely by default, allowing you to reference 
                past elections at any time. If you wish to delete an election and its associated 
                data, you can do so from the election management section of your dashboard. Note 
                that deletion is permanent and cannot be undone.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </PageLayout>
  );
};

export default FAQ;
