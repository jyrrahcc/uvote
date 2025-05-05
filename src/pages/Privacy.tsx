
import PageLayout from "@/components/layout/PageLayout";
import { useEffect } from "react";

const Privacy = () => {
  useEffect(() => {
    document.title = "Privacy Policy | uVote";
  }, []);

  return (
    <PageLayout>
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Last updated: May 5, 2025
        </p>

        <div className="prose prose-slate max-w-none">
          <p>
            At uVote, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
            and safeguard your information when you use our platform.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, and password.</li>
            <li><strong>Profile Information:</strong> Additional information you may provide such as profile picture, organization, or role.</li>
            <li><strong>Election Data:</strong> Information related to elections you create, including titles, descriptions, candidate information, and voting periods.</li>
            <li><strong>Voting Information:</strong> Records of your participation in elections, including your vote selections.</li>
          </ul>
          
          <p>
            We also automatically collect certain information when you use uVote, including:
          </p>
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li><strong>Log Data:</strong> Information such as your IP address, browser type, operating system, referring webpage, and pages visited.</li>
            <li><strong>Device Information:</strong> Information about the device you use to access uVote.</li>
            <li><strong>Usage Information:</strong> Details about your interactions with uVote, such as the features you use and the time spent on the platform.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li>Provide, maintain, and improve uVote</li>
            <li>Process and record votes in elections</li>
            <li>Verify user identity and prevent fraud</li>
            <li>Send administrative messages, updates, and security alerts</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Monitor and analyze trends, usage, and activities</li>
            <li>Protect the security and integrity of our platform</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Vote Privacy</h2>
          <p>
            We take special measures to protect the privacy of your votes:
          </p>
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li>Individual votes are stored securely and are not publicly viewable</li>
            <li>Only aggregated results are displayed for elections</li>
            <li>Election administrators cannot see individual voting choices</li>
            <li>Our system is designed to prevent the tracing of specific votes to individual voters</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to outside parties except in the following circumstances:
          </p>
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li><strong>Service Providers:</strong> We may share information with third-party vendors who provide services on our behalf.</li>
            <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal processes.</li>
            <li><strong>Protection of Rights:</strong> We may share information to protect our rights, privacy, safety, or property.</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, your information may be transferred as a business asset.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information, including:
          </p>
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security audits and vulnerability testing</li>
            <li>Access controls and authentication requirements</li>
            <li>Monitoring systems for potential security breaches</li>
          </ul>
          <p>
            While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the Internet 
            or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Your Rights and Choices</h2>
          <p>
            You have several rights regarding your personal information:
          </p>
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li><strong>Access:</strong> You can request access to the personal information we hold about you.</li>
            <li><strong>Correction:</strong> You can ask us to correct inaccurate or incomplete information.</li>
            <li><strong>Deletion:</strong> You can request the deletion of your personal information in certain circumstances.</li>
            <li><strong>Restriction:</strong> You can ask us to restrict the processing of your information in certain cases.</li>
            <li><strong>Data Portability:</strong> You can request a copy of your information in a structured, commonly used, and machine-readable format.</li>
            <li><strong>Objection:</strong> You have the right to object to our processing of your information in some circumstances.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Children's Privacy</h2>
          <p>
            uVote is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. 
            If you are a parent or guardian and believe that your child has provided us with personal information, please contact us.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page 
            and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us at privacy@uvote.com.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Privacy;
