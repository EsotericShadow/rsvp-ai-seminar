import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function RsvpErrorPage() {
  return (
    <div className="bg-brand-light min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 bg-white/50 backdrop-blur-sm shadow-lg rounded-2xl text-center space-y-6">
        <XCircle className="h-16 w-16 text-red-500 mx-auto" />
        <h1 className="text-3xl font-bold text-brand-ink">Oops! Something Went Wrong.</h1>
        <p className="text-lg text-brand-mid">
          We encountered an issue while processing your RSVP. Please try again.
        </p>
        <Link
          href="/rsvp"
          className="inline-flex items-center justify-center rounded-md bg-brand-ink px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-mid"
        >
          Go back to RSVP form
        </Link>
      </div>
    </div>
  );
}