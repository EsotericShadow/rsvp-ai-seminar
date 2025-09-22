import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Code of Conduct | AI in Northern BC Event",
  description: "Read the code of conduct for the AI in Northern BC information session. Our commitment to creating a respectful, inclusive, and professional environment for all attendees.",
  keywords: [
    "code of conduct",
    "AI event conduct",
    "professional behavior",
    "inclusive event",
    "respectful environment",
    "Evergreen Web Solutions"
  ],
  openGraph: {
    title: "Code of Conduct - AI in Northern BC Event",
    description: "Read the code of conduct for the AI in Northern BC information session. Our commitment to creating a respectful, inclusive, and professional environment.",
    url: "https://rsvp.evergreenwebsolutions.ca/conduct",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Code of Conduct - AI in Northern BC Event",
    description: "Read the code of conduct for the AI in Northern BC information session. Our commitment to creating a respectful, inclusive, and professional environment.",
  },
  alternates: {
    canonical: "https://rsvp.evergreenwebsolutions.ca/conduct",
  },
}

export default function ConductPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Code of Conduct</h1>
          <p className="text-lg text-gray-600">
            Our commitment to creating a respectful, inclusive, and professional environment
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-gray-50 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Commitment</h2>
            <p className="text-gray-700 mb-4">
              Evergreen Web Solutions is committed to providing a welcoming and inclusive environment for all participants at our AI information session. We value the participation of every attendee and want all participants to have an enjoyable and fulfilling experience.
            </p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Expected Behavior</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-3 mt-1">✓</span>
                  <span>Be respectful and inclusive in your interactions with other participants</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-3 mt-1">✓</span>
                  <span>Use welcoming and inclusive language</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-3 mt-1">✓</span>
                  <span>Be respectful of differing viewpoints and experiences</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-3 mt-1">✓</span>
                  <span>Accept constructive criticism gracefully</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-3 mt-1">✓</span>
                  <span>Focus on what is best for the community and other participants</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Unacceptable Behavior</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-600 mr-3 mt-1">✗</span>
                  <span>Harassment, discrimination, or intimidation in any form</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-3 mt-1">✗</span>
                  <span>Inappropriate or offensive comments or behavior</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-3 mt-1">✗</span>
                  <span>Disruptive behavior that interferes with the event</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-3 mt-1">✗</span>
                  <span>Use of sexualized language or imagery</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-3 mt-1">✗</span>
                  <span>Personal attacks or trolling</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Reporting</h2>
              <p className="text-gray-700 mb-4">
                If you experience or witness unacceptable behavior, please report it to Gabriel Lacroix or any event staff member immediately. All reports will be handled with discretion and appropriate action will be taken.
              </p>
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Contact Information</h3>
                <p className="text-blue-800">
                  Gabriel Lacroix, Event Host<br />
                  Email: gabriel@evergreenwebsolutions.ca<br />
                  Phone: Available at the event
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Consequences</h2>
              <p className="text-gray-700">
                Participants asked to stop any unacceptable behavior are expected to comply immediately. Event organizers may take any action they deem appropriate, including warning the offender or expelling them from the event without refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acknowledgement</h2>
              <p className="text-gray-700">
                By participating in this event, you acknowledge that you have read, understood, and agree to abide by this Code of Conduct. This Code of Conduct applies to all event participants, including attendees, speakers, sponsors, and staff.
              </p>
            </section>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">
              This Code of Conduct is adapted from the <a href="https://confcodeofconduct.com/" className="text-emerald-600 hover:text-emerald-700" target="_blank" rel="noopener noreferrer">Conference Code of Conduct</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}