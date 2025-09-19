import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function RsvpSuccessPage() {
  return (
    <div className="bg-brand-light min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 bg-white/50 backdrop-blur-sm shadow-lg rounded-2xl text-center space-y-6">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-3xl font-bold text-brand-ink">Seat Reserved!</h1>
        <p className="text-lg text-brand-mid">
          Thank you for your RSVP. Your seat is reserved for:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg text-left space-y-2">
          <p className="font-semibold text-brand-ink">AI & Business in the North</p>
          <p className="text-sm text-brand-mid">October 23, 2025 · Sunshine Inn · Terrace, BC</p>
          <p className="text-sm text-brand-mid">What to bring/expect: Your curiosity and business questions!</p>
        </div>
        <div className="flex flex-col space-y-3">
          <a
            href="#" // Placeholder for .ics download
            className="inline-flex items-center justify-center rounded-md bg-brand-ink px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-mid"
          >
            Add to Calendar (.ics)
          </a>
          <a
            href="#" // Placeholder for Google Calendar
            className="inline-flex items-center justify-center rounded-md border border-brand-mid px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-gray-100"
          >
            Add to Google Calendar
          </a>
        </div>
        <Link href="/rsvp" className="text-sm text-brand-mid underline hover:text-brand-ink">
          Go back to RSVP form
        </Link>
      </div>
    </div>
  );
}