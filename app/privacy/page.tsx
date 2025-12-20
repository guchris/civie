import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Shield, ArrowLeft } from "lucide-react";
import { BackButton } from "@/components/back-button";

export const metadata: Metadata = {
  title: "Privacy Policy | Civie",
  description: "Privacy Policy for Civie - Your say, every day. Anonymous civic dialogue.",
};

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">civie</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/terms"
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Terms of Service</span>
            </Link>
            <Link
              href="/privacy"
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                "bg-primary text-primary-foreground"
              )}
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy Policy</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top row with back button and last updated */}
        <div className="mb-8 flex items-center justify-between">
          <BackButton />
          <div className="rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        </div>

      <Card className="shadow-none">
        <CardContent className="pt-6 space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              Welcome to Civie ("we," "our," or "us"). We are committed to protecting your privacy and ensuring 
              the anonymity of your responses. This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you use our daily civic engagement platform ("the Service"). Please read this 
              Privacy Policy carefully. By using the Service, you agree to the collection and use of information in 
              accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
            <div className="text-sm leading-relaxed text-muted-foreground space-y-4">
              <div>
                <h3 className="font-semibold mb-2">2.1 Account Information</h3>
                <p className="mb-2">
                  When you register for an account, we collect:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Email address (for authentication and communication)</li>
                  <li>Phone number (for identity verification via OTP)</li>
                  <li>Authentication credentials managed by Firebase Authentication</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2.2 Demographic Information</h3>
                <p className="mb-2">
                  For identity verification and demographic aggregation, we collect:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Birth date (to calculate age for demographic categorization)</li>
                  <li>Gender</li>
                  <li>Race/ethnicity</li>
                  <li>Zip code (for geographic demographic analysis)</li>
                </ul>
                <p className="mt-2">
                  <strong>Important:</strong> This demographic information is used for verification and aggregation 
                  purposes only. It is never linked to your individual responses, which remain completely anonymous.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2.3 Response Data</h3>
                <p className="mb-2">
                  When you answer questions on the Service:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>We log that you answered a question (not which answer you chose)</li>
                  <li>Your individual responses are stored separately in an anonymous collection</li>
                  <li>Responses are stored with demographic data (age, gender, race/ethnicity, zip code) but without 
                      any personally identifiable information linking them to you</li>
                  <li>Only aggregate counters are maintained in your user profile</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2.4 Usage Data</h3>
                <p className="mb-2">
                  We automatically collect certain information when you use the Service:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Device information (browser type, operating system)</li>
                  <li>IP address (for security and fraud prevention)</li>
                  <li>Usage patterns (pages visited, time spent, features used)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Legal Basis for Processing (GDPR)</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              If you are located in the European Economic Area (EEA), we process your personal information under the 
              following legal bases:
            </p>
            <ul className="list-disc list-inside text-sm leading-relaxed text-muted-foreground space-y-2 ml-4">
              <li><strong>Consent:</strong> When you register for an account and provide demographic information</li>
              <li><strong>Contractual Necessity:</strong> To provide the Service and fulfill our obligations under these Terms</li>
              <li><strong>Legitimate Interests:</strong> To ensure data integrity, prevent fraud, and improve the Service</li>
              <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. How We Use Your Information</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc list-inside text-sm leading-relaxed text-muted-foreground space-y-2 ml-4">
              <li><strong>Service Operation:</strong> To provide, maintain, and improve the Service</li>
              <li><strong>Identity Verification:</strong> To verify your identity and ensure data integrity</li>
              <li><strong>Data Aggregation:</strong> To create anonymized, aggregated results with demographic breakdowns</li>
              <li><strong>Account Management:</strong> To manage your account, track your participation, and maintain your streak</li>
              <li><strong>Communication:</strong> To send you service-related notifications and updates</li>
              <li><strong>Security:</strong> To detect, prevent, and address technical issues, fraud, and abuse</li>
              <li><strong>Analytics:</strong> To understand how users interact with the Service and improve user experience</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Special Categories of Personal Data</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              Some of the information we collect, such as race/ethnicity, may be considered "special categories" of 
              personal data under GDPR and other privacy laws. We collect this information only with your explicit 
              consent and solely for the purpose of demographic aggregation in anonymized form. This sensitive data 
              is never linked to your individual responses and is used exclusively for creating demographic breakdowns 
              in aggregated results. You may withdraw your consent at any time by contacting us, though this may 
              affect your ability to use certain features of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Anonymity and Data Protection</h2>
            <div className="text-sm leading-relaxed text-muted-foreground space-y-4">
              <div>
                <h3 className="font-semibold mb-2">4.1 Response Anonymity</h3>
                <p>
                  Your individual responses are stored in a separate, anonymous collection. We use a technical 
                  architecture that ensures:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Your responses are never linked to your account or personal information</li>
                  <li>Only aggregate data (counts) are stored in your user profile</li>
                  <li>Demographic data is stored with responses but without any PII linking them to you</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4.2 Data Aggregation</h3>
                <p>
                  All results published by Civie are anonymized aggregates. We:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Publish only statistical summaries and demographic breakdowns</li>
                  <li>Suppress demographic buckets if sample sizes are too small to protect privacy</li>
                  <li>Never publish individual responses or data that could identify you</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4.3 Immutable Fields</h3>
                <p>
                  During identity verification, we extract immutable demographic fields (birth date, gender) to ensure 
                  data integrity. These fields are used for demographic categorization in aggregated results but are 
                  never linked to your individual responses.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Data Storage and Security</h2>
            <div className="text-sm leading-relaxed text-muted-foreground space-y-4">
              <p>
                We use Firebase (Google Cloud Platform) to store and process your data. We implement appropriate 
                technical and organizational measures to protect your information, including:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security assessments and updates</li>
                <li>Firestore security rules that prevent unauthorized access</li>
                <li>Separation of user account data from anonymous response data</li>
              </ul>
              <p>
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we 
                strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Data Breach Notification</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              In the event of a data breach that may affect your personal information, we will notify you and the 
              relevant supervisory authorities as required by applicable law. We will provide notice without undue 
              delay and, where feasible, within 72 hours of becoming aware of the breach, unless the breach is 
              unlikely to result in a risk to your rights and freedoms. Notifications will include information about 
              the nature of the breach, the categories of data affected, and the measures we are taking to address it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Data Sharing and Disclosure</h2>
            <div className="text-sm leading-relaxed text-muted-foreground space-y-4">
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share information 
                in the following circumstances:
              </p>

              <div>
                <h3 className="font-semibold mb-2">6.1 Aggregated Data</h3>
                <p>
                  We may publish or share anonymized, aggregated data derived from user responses. This data cannot 
                  be used to identify individual users.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">9.2 Service Providers</h3>
                <p>
                  We may share information with third-party service providers who perform services on our behalf, 
                  such as:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Firebase/Google Cloud Platform (data storage and authentication)</li>
                  <li>Google reCAPTCHA (bot prevention and security during phone verification)</li>
                  <li>Twilio (SMS/OTP verification)</li>
                  <li>Vercel (hosting and analytics)</li>
                  <li>Google Fonts (font delivery - may collect IP addresses)</li>
                </ul>
                <p className="mt-2">
                  These service providers are contractually obligated to protect your information and use it only 
                  for the purposes we specify. Some third-party services, such as Google reCAPTCHA and Google Fonts, 
                  may collect information directly from you in accordance with their own privacy policies. We encourage 
                  you to review their privacy policies.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">9.3 Third-Party Links</h3>
                <p>
                  The Service may contain links to third-party websites or services. We are not responsible for the 
                  privacy practices of these third parties. We encourage you to read the privacy policies of any 
                  third-party websites or services you visit.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">9.4 Legal Requirements</h3>
                <p>
                  We may disclose your information if required to do so by law or in response to valid requests by 
                  public authorities (e.g., a court or government agency).
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">9.5 Business Transfers</h3>
                <p>
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred as 
                  part of that transaction. We will notify you of any such change in ownership or control.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Your Rights and Choices</h2>
            <div className="text-sm leading-relaxed text-muted-foreground space-y-4">
              <p>
                Depending on your location, you may have certain rights regarding your personal information:
              </p>

              <div>
                <h3 className="font-semibold mb-2">10.1 Access and Correction</h3>
                <p>
                  You can access and update your account information and demographic data through your profile settings 
                  in the Service.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">10.2 Account Deletion</h3>
                <p>
                  You may request deletion of your account at any time. Upon account deletion:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Your account information will be deleted</li>
                  <li>Your anonymous responses will remain in the aggregated dataset (as they cannot be linked to you)</li>
                  <li>Aggregate data that has already been published will remain available</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">10.3 Data Portability</h3>
                <p>
                  You may request a copy of your account data in a structured, machine-readable format.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">10.4 Opt-Out</h3>
                <p>
                  You can opt out of non-essential communications by adjusting your account settings. You cannot opt 
                  out of service-related communications that are necessary for the operation of the Service.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">10.5 Right to Object and Withdraw Consent (GDPR)</h3>
                <p>
                  If you are located in the EEA, you have the right to object to processing of your personal information 
                  based on legitimate interests. You also have the right to withdraw your consent at any time where we 
                  rely on consent to process your information. Withdrawing consent will not affect the lawfulness of 
                  processing before the withdrawal.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">10.6 Right to Restrict Processing (GDPR)</h3>
                <p>
                  If you are located in the EEA, you have the right to request that we restrict the processing of your 
                  personal information in certain circumstances, such as when you contest the accuracy of the data or 
                  object to processing.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">10.7 Automated Decision-Making</h3>
                <p>
                  We do not use automated decision-making or profiling that produces legal effects or similarly 
                  significantly affects you. All processing is done to provide the Service and create aggregated results.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">10.8 California Privacy Rights</h3>
                <p>
                  If you are a California resident, you have additional rights under the California Consumer Privacy 
                  Act (CCPA), including the right to know what personal information we collect, the right to delete 
                  personal information, and the right to opt-out of the sale of personal information (we do not sell 
                  personal information).
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">10.9 European Privacy Rights</h3>
                <p>
                  If you are located in the European Economic Area (EEA), you have additional rights under the General 
                  Data Protection Regulation (GDPR), including the right to access, rectify, erase, restrict processing, 
                  object to processing, and data portability. You also have the right to lodge a complaint with a 
                  supervisory authority if you believe we have violated your data protection rights.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">10.10 Supervisory Authority (GDPR)</h3>
                <p>
                  If you are located in the EEA and believe we have violated your data protection rights, you have the 
                  right to lodge a complaint with your local data protection supervisory authority. A list of supervisory 
                  authorities can be found at{" "}
                  <a 
                    href="https://edpb.europa.eu/about-edpb/board/members_en" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline hover:no-underline"
                  >
                    https://edpb.europa.eu/about-edpb/board/members_en
                  </a>.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">11. Cookies and Tracking Technologies</h2>
            <div className="text-sm leading-relaxed text-muted-foreground space-y-4">
              <p>
                We use cookies and similar tracking technologies to track activity on the Service and store certain 
                information. Cookies are files with a small amount of data that may include an anonymous unique identifier. 
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, 
                if you do not accept cookies, you may not be able to use some portions of our Service.
              </p>
              <div>
                <h3 className="font-semibold mb-2">11.1 Types of Cookies We Use</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Essential Cookies:</strong> Required for the Service to function properly (e.g., authentication)</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Service</li>
                  <li><strong>Security Cookies:</strong> Used for fraud prevention and security (e.g., reCAPTCHA)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">11.2 Do Not Track Signals</h3>
                <p>
                  Some browsers incorporate a "Do Not Track" (DNT) feature that signals to websites you visit that 
                  you do not want to have your online activity tracked. Currently, there is no industry standard for 
                  recognizing and responding to DNT signals. We do not currently respond to DNT signals. We will continue 
                  to monitor developments in this area and may update our practices in the future.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">12. Children's Privacy</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              The Service is not intended for individuals under the age of 18. We do not knowingly collect personal 
              information from children under 18. If you are a parent or guardian and believe your child has provided 
              us with personal information, please contact us immediately. If we become aware that we have collected 
              personal information from a child under 18, we will take steps to delete that information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">13. Data Retention</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              We retain your account information for as long as your account is active or as needed to provide you 
              with the Service. Anonymous response data is retained indefinitely as part of the aggregated dataset. 
              If you delete your account, we will delete your account information but may retain anonymous response 
              data that cannot be linked to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">14. International Data Transfers</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              Your information may be transferred to and processed in countries other than your country of residence. 
              These countries may have data protection laws that differ from those in your country. By using the Service, 
              you consent to the transfer of your information to these countries. We take appropriate measures to ensure 
              that your information receives an adequate level of protection.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">15. Changes to This Privacy Policy</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
              new Privacy Policy on this page and updating the "Last updated" date. We will also notify you via email 
              or through the Service if changes are material. You are advised to review this Privacy Policy periodically 
              for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">16. Contact Us</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us through 
              the Service or at the contact information provided on our website. For privacy-related requests, 
              including requests to access, correct, or delete your information, please contact us and we will 
              respond within a reasonable timeframe.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}

