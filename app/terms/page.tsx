"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b-4 border-foreground sticky top-0 z-40">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-muted transition-colors border-2 border-transparent hover:border-foreground"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Terms of Service</h1>
        </div>
      </header>

      <div className="p-4 max-w-3xl mx-auto pb-20">
        <div className="brutalist-card p-6 space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">Last updated: May 2026</p>
          </div>

          <section>
            <h2 className="text-lg font-bold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using Bizlink ("the Platform"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground">
              Bizlink is a B2B platform that enables businesses to showcase products, connect with potential 
              partners, and facilitate wholesale inquiries. We provide tools for product listings, company 
              profiles, messaging, and networking.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. User Accounts</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must be at least 18 years old to use our services</li>
              <li>Business accounts must represent legitimate, legally operating businesses</li>
              <li>You may not create multiple accounts without our permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. User Content</h2>
            <p className="text-muted-foreground mb-2">
              You retain ownership of content you post on Bizlink. By posting content, you grant us a 
              non-exclusive, worldwide license to use, display, and distribute your content on our platform.
            </p>
            <p className="text-muted-foreground">
              You are solely responsible for the content you post and must ensure it does not violate any 
              laws or third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. Prohibited Activities</h2>
            <p className="text-muted-foreground mb-2">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Post false, misleading, or fraudulent content</li>
              <li>Sell prohibited, counterfeit, or illegal products</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to access accounts or systems without authorization</li>
              <li>Use automated systems to scrape or collect data</li>
              <li>Interfere with the proper functioning of the platform</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. Subscription and Payments</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Subscription plans are billed in advance on a monthly or annual basis</li>
              <li>Payments are non-refundable except as required by law</li>
              <li>We may change pricing with 30 days notice to existing subscribers</li>
              <li>You are responsible for any taxes applicable to your subscription</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">7. Intellectual Property</h2>
            <p className="text-muted-foreground">
              Bizlink and its original content, features, and functionality are owned by Golden techS 
              and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Bizlink is provided "as is" without warranties of any kind. We are not liable for any 
              indirect, incidental, special, or consequential damages arising from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">9. Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate your account at any time for violations of 
              these terms or for any other reason at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">10. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these terms from time to time. Continued use of the platform after changes 
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">11. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about these Terms of Service, please contact us at legal@bizlink.app
            </p>
          </section>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Golden techS - Bizlink Platform
        </p>
      </div>
    </div>
  )
}
