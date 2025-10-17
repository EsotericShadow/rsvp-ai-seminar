'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { coreRsvpFormSchema, RsvpFormValues } from '@/lib/validators';

// PhoneField component
function PhoneField({
  value,
  onChange,
  onBlur,
  id = "phone",
}: {
  value?: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  id?: string;
}) {
  const [a, b, c] = (value ?? "").split("-");

  const setPart = (part: "a" | "b" | "c", next: string, el?: HTMLInputElement | null) => {
    const digits = next.replace(/\D/g, "");

    if (part === "a" && digits.length > 3) {
      const fullNum = digits.slice(0, 10);
      const na = fullNum.slice(0, 3);
      const nb = fullNum.slice(3, 6);
      const nc = fullNum.slice(6, 10);
      onChange([na, nb, nc].filter(Boolean).join("-"));
      
      const focusId = nc.length === 4 ? `${id}-c` : nb.length === 3 ? `${id}-b` : `${id}-a`;
      setTimeout(() => (document.getElementById(focusId) as HTMLInputElement | null)?.focus(), 0);
      return;
    }

    const max = part === "c" ? 4 : 3;
    const v = digits.slice(0, max);

    const na = part === "a" ? v : (a ?? "");
    const nb = part === "b" ? v : (b ?? "");
    const nc = part === "c" ? v : (c ?? "");

    onChange([na, nb, nc].filter(Boolean).join("-"));

    if (v.length === max && el) {
      const nextId = part === "a" ? `${id}-b` : part === "b" ? `${id}-c` : null;
      if (nextId) {
        const nextEl = document.getElementById(nextId) as HTMLInputElement | null;
        nextEl?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const digits = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 10);
    if (!digits) return;
    e.preventDefault();
    const na = digits.slice(0, 3);
    const nb = digits.slice(3, 6);
    const nc = digits.slice(6, 10);
    onChange([na, nb, nc].filter(Boolean).join("-"));
    const focusId = nc.length === 4 ? `${id}-c` : nb.length === 3 ? `${id}-b` : `${id}-a`;
    setTimeout(() => (document.getElementById(focusId) as HTMLInputElement | null)?.focus(), 0);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        id={`${id}-a`}
        inputMode="numeric"
        pattern="[0-9]*"
        value={a ?? ""}
        onChange={(e) => setPart("a", e.target.value, e.currentTarget)}
        onPaste={handlePaste}
        onBlur={onBlur}
        className="h-12 w-16 rounded-lg border border-gray-300 bg-white px-2 text-center text-base text-gray-900 placeholder:text-gray-400 focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/60 sm:h-10 sm:text-sm"
        placeholder="555"
        aria-label="Area code"
      />
      <span className="text-lg text-gray-700 sm:text-base">-</span>
      <input
        id={`${id}-b`}
        inputMode="numeric"
        pattern="[0-9]*"
        value={b ?? ""}
        onChange={(e) => setPart("b", e.target.value, e.currentTarget)}
        onPaste={handlePaste}
        onBlur={onBlur}
        className="h-12 w-16 rounded-lg border border-gray-300 bg-white px-2 text-center text-base text-gray-900 placeholder:text-gray-400 focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/60 sm:h-10 sm:text-sm"
        placeholder="123"
        aria-label="Prefix"
      />
      <span className="text-lg text-gray-700 sm:text-base">-</span>
      <input
        id={`${id}-c`}
        inputMode="numeric"
        pattern="[0-9]*"
        value={c ?? ""}
        onChange={(e) => setPart("c", e.target.value, e.currentTarget)}
        onPaste={handlePaste}
        onBlur={onBlur}
        className="h-12 w-20 rounded-lg border border-gray-300 bg-white px-2 text-center text-base text-gray-900 placeholder:text-gray-400 focus:border-brand-sage focus:outline-none focus:ring-2 focus:ring-brand-sage/60 sm:h-10 sm:text-sm"
        placeholder="4567"
        aria-label="Line number"
      />
    </div>
  );
}


export function RsvpForm() {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(coreRsvpFormSchema),
    mode: 'onTouched', // Show errors on blur
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      attendanceStatus: 'YES',
      attendeeCount: 1,
      dietaryPreference: 'NONE',
      accessibilityNeeds: '',
      referralSource: 'WORD_OF_MOUTH',
      wantsResources: false,
      wantsAudit: false,
      learningGoal: '',
    },
  });

  const fieldInputClass = 'mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-brand-sage focus:ring-2 focus:ring-brand-sage/60 sm:py-2.5 sm:text-sm';

  const validateStep = async (idx: number) => {
    if (idx === 0) {
      // Contact
      return form.trigger(['firstName', 'lastName', 'email','phone'] as (keyof RsvpFormValues)[]);
    }
    if (idx === 1) {
      // Attendance (+ attendeeCount if YES)
      const keys: (keyof RsvpFormValues)[] = ['attendanceStatus'];
      if (form.getValues('attendanceStatus') === 'YES') keys.push('attendeeCount');
      return form.trigger(keys);
    }
    if (idx === 2) {
      // Diet & Accessibility
      const keys: (keyof RsvpFormValues)[] = ['dietaryPreference','accessibilityNeeds'];
      if (form.getValues('dietaryPreference') === 'OTHER') keys.push('dietaryOther');
      return form.trigger(keys);
    }
    if (idx === 3) {
      // Referral
      const keys: (keyof RsvpFormValues)[] = ['referralSource'];
      if (form.getValues('referralSource') === 'OTHER') keys.push('referralOther');
      return form.trigger(keys);
    }
    if (idx === 4) {
      // Extras
      return form.trigger(['wantsResources','wantsAudit','learningGoal'] as (keyof RsvpFormValues)[]);
    }
    return true;
  };

  const onNext = async () => {
    const ok = await validateStep(currentStep);
    if (!ok) return;
    setCurrentStep((s) => Math.min(s + 1, 4));
  };

  const onPrev = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  // Helper functions for engagement tracking
  function getScrollDepth(): number {
    const doc = document.documentElement;
    const totalScrollable = doc.scrollHeight - window.innerHeight;
    if (totalScrollable <= 0) return 100;
    const current = window.scrollY;
    return Math.round((current / totalScrollable) * 100);
  }

  function getInteractionCounts(): Record<string, number> {
    // This would be tracked by AnalyticsBeacon, but for RSVP we'll use a simplified version
    return {
      clicks: 0, // Would be tracked by AnalyticsBeacon
      keypresses: 0,
      copies: 0,
      pointerMoves: 0,
    };
  }

  function getVisibilityTimeline(): Array<{ state: string; at: number }> {
    return [{ state: document.visibilityState, at: Date.now() }];
  }

  function calculateEngagementScore(): number {
    // Simple engagement score based on available metrics
    const scrollDepth = getScrollDepth();
    const timeOnPage = performance.now();
    
    // Weight scroll depth (40%) and time on page (60%)
    const scrollScore = Math.min(scrollDepth, 100);
    const timeScore = Math.min(timeOnPage / 1000, 100); // Convert to seconds, cap at 100
    
    return Math.round(scrollScore * 0.4 + timeScore * 0.6);
  }

  async function collectClientContext(): Promise<Record<string, unknown>> {
    if (typeof window === 'undefined') return {};

    try {
      const nav = window.navigator as Navigator & { userAgentData?: { platform?: string; brands?: Array<{ brand: string; version: string }>; mobile?: boolean }; storage?: Navigator['storage']; }
      const screen = window.screen;
      const orientation = screen?.orientation?.type;
      const language = nav.language ?? (nav as any).userLanguage;
      const languages = Array.isArray(nav.languages) && nav.languages.length ? nav.languages : undefined;
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const platform = nav.userAgentData?.platform || nav.platform;
      const deviceMemory = typeof (nav as any).deviceMemory === 'number' ? (nav as any).deviceMemory : undefined;
      const hardwareConcurrency = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : undefined;
      const maxTouchPoints = typeof nav.maxTouchPoints === 'number' ? nav.maxTouchPoints : undefined;
      const storageEstimate = nav.storage && typeof nav.storage.estimate === 'function' ? await nav.storage.estimate() : undefined;

      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      const navigation = navigationEntry
        ? {
            type: navigationEntry.type,
            startTime: Math.round(navigationEntry.startTime),
            duration: Math.round(navigationEntry.duration),
            domContentLoaded: Math.round(navigationEntry.domContentLoadedEventEnd),
            loadEventEnd: Math.round(navigationEntry.loadEventEnd),
            responseEnd: Math.round(navigationEntry.responseEnd),
            requestStart: Math.round(navigationEntry.requestStart),
            transferSize: navigationEntry.transferSize,
            encodedBodySize: navigationEntry.encodedBodySize,
            decodedBodySize: navigationEntry.decodedBodySize,
            redirectCount: navigationEntry.redirectCount,
          }
        : undefined;

      const paintEntries = performance.getEntriesByType('paint') as PerformanceEntry[];
      const paint = paintEntries.length
        ? paintEntries.map((entry) => ({
            name: entry.name,
            startTime: Math.round(entry.startTime),
            duration: Math.round(entry.duration),
          }))
        : undefined;

      // Engagement tracking
      const engagementInfo = {
        scrollDepth: getScrollDepth(),
        timeOnPageMs: Math.round(performance.now()),
        interactionCounts: getInteractionCounts(),
        visibility: getVisibilityTimeline(),
        // Calculate engagement score (0-100)
        engagementScore: calculateEngagementScore(),
        // Session metrics
        pageViews: 1, // RSVP form is typically 1 page view
        sessionDuration: Math.round(performance.now()),
        bounceRate: 0, // If user is filling out RSVP form, they're engaged (not bounced)
      };

      return {
        language,
        languages,
        tz,
        screenW: screen?.width,
        screenH: screen?.height,
        viewportW: window.innerWidth,
        viewportH: window.innerHeight,
        orientation,
        dpr: window.devicePixelRatio,
        platform,
        deviceMemory,
        hardwareConcurrency,
        maxTouchPoints,
        storage: storageEstimate,
        navigation,
        paint,
        performance: {
          timeOrigin: Math.round(performance.timeOrigin),
          now: Math.round(performance.now()),
        },
        ...engagementInfo,
      };
    } catch (error) {
      console.error('Failed to collect client context', error);
      return {};
    }
  }

  async function onSubmit(values: RsvpFormValues) {
    try {
      // Validate phone is complete before submission
      const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
      if (!phoneRegex.test(values.phone)) {
        form.setError('phone', { 
          type: 'manual', 
          message: 'Please complete your phone number (format: 250-635-1234)' 
        });
        setCurrentStep(0); // Go back to step 0 where phone field is
        alert('Please complete your phone number in the format: 250-635-1234');
        return;
      }
      
      const context = await collectClientContext();

      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...values, ...context }),
      });

      if (response.ok) {
        alert('RSVP Submitted! Thank you for your RSVP.');
        form.reset();
        setCurrentStep(0);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('RSVP submission failed:', errorData);
        alert(`Submission Failed: ${errorData.message || 'Something went wrong.'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Submission Error: Could not connect to the server.');
    }
  }

  const stepsContent: JSX.Element[] = [
    // Step 1: Contact
    <div className="space-y-4" key="step1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-800">First Name</label>
          <input
            id="firstName"
            autoComplete="given-name"
            {...form.register('firstName')}
            className={fieldInputClass}
          />
          {form.formState.errors.firstName && <p className="mt-1 text-sm text-red-600">{form.formState.errors.firstName.message}</p>}
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-800">Last Name</label>
          <input
            id="lastName"
            autoComplete="family-name"
            {...form.register('lastName')}
            className={fieldInputClass}
          />
          {form.formState.errors.lastName && <p className="mt-1 text-sm text-red-600">{form.formState.errors.lastName.message}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-800">Email</label>
        <input
          type="email"
          id="email"
          autoComplete="email"
          {...form.register('email')}
          className={fieldInputClass}
        />
        {form.formState.errors.email && <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-800">Phone</label>
        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <div>
              <PhoneField value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
              {fieldState.error && (
                <p className="mt-2 text-sm text-red-600">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />
      </div>
    </div>,

    // Step 2: Attendance
    <div className="space-y-4" key="step2">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <label htmlFor="attendanceStatus" className="block text-sm font-medium text-gray-800">Will you attend?</label>
          <select
            id="attendanceStatus"
            {...form.register('attendanceStatus')}
            className={fieldInputClass}
          >
            <option value="YES">Yes</option>
            <option value="NO">No</option>
            <option value="MAYBE">Maybe</option>
          </select>
          {form.formState.errors.attendanceStatus && <p className="mt-1 text-sm text-red-600">{form.formState.errors.attendanceStatus.message}</p>}
        </div>
        {form.watch('attendanceStatus') === 'YES' && (
          <div>
            <label htmlFor="attendeeCount" className="block text-sm font-medium text-gray-800">Number of Attendees</label>
            <input
              type="number"
              id="attendeeCount"
              {...form.register('attendeeCount', { valueAsNumber: true, min: 1, max: 20 })}
              className={fieldInputClass}
            />
            {form.formState.errors.attendeeCount && <p className="mt-1 text-sm text-red-600">{form.formState.errors.attendeeCount.message}</p>}
          </div>
        )}
      </div>
    </div>,

    // Step 3: Diet & Accessibility
    <div className="space-y-4" key="step3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <label htmlFor="dietaryPreference" className="block text-sm font-medium text-gray-800">Dietary Preferences</label>
          <select
            id="dietaryPreference"
            {...form.register('dietaryPreference')}
            className={fieldInputClass}
          >
            <option value="NONE">None</option>
            <option value="VEGETARIAN">Vegetarian</option>
            <option value="VEGAN">Vegan</option>
            <option value="GLUTEN_FREE">Gluten-free</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        {form.watch('dietaryPreference') === 'OTHER' && (
          <div>
            <label htmlFor="dietaryOther" className="block text-sm font-medium text-gray-800">Please specify</label>
            <input
              id="dietaryOther"
              {...form.register('dietaryOther')}
              className={fieldInputClass}
            />
             {form.formState.errors.dietaryOther && <p className="mt-1 text-sm text-red-600">{form.formState.errors.dietaryOther.message}</p>}
          </div>
        )}
        </div>
      <div>
        <label htmlFor="accessibilityNeeds" className="block text-sm font-medium text-gray-800">Accessibility Needs (Optional)</label>
        <textarea
          id="accessibilityNeeds"
          rows={3}
          {...form.register('accessibilityNeeds')}
          className={`${fieldInputClass} min-h-[3.5rem]`}
        ></textarea>
      </div>
    </div>,

    // Step 4: Referral
    <div className="space-y-4" key="step4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <label htmlFor="referralSource" className="block text-sm font-medium text-gray-800">How did you hear about us?</label>
          <select
            id="referralSource"
            {...form.register('referralSource')}
            className={fieldInputClass}
          >
            <option value="RADIO">Radio</option>
            <option value="RADIO_AD">Radio Ad</option>
            <option value="CHAMBER">Chamber</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="FACEBOOK_EVENT">Facebook Event</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="WORD_OF_MOUTH">Word of Mouth</option>
            <option value="TERRACE_STANDARD">Terrace Standard</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        {form.watch('referralSource') === 'OTHER' && (
          <div>
            <label htmlFor="referralOther" className="block text-sm font-medium text-gray-800">Please specify</label>
            <input
              id="referralOther"
              {...form.register('referralOther')}
              className={fieldInputClass}
            />
            {form.formState.errors.referralOther && <p className="mt-1 text-sm text-red-600">{form.formState.errors.referralOther.message}</p>}
          </div>
        )}
      </div>
    </div>,

    // Step 5: Extras
    <div className="space-y-4" key="step5">
      <div className="relative flex items-start">
        <div className="flex h-5 items-center">
          <input
            id="wantsResources"
            type="checkbox"
            {...form.register('wantsResources')}
            className="h-4 w-4 rounded border-gray-300 text-brand-sage focus:ring-brand-sage"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="wantsResources" className="font-medium text-gray-800">Send me the free AI workflows PDF after the event</label>
        </div>
      </div>
      <div className="relative flex items-start">
        <div className="flex h-5 items-center">
          <input
            id="wantsAudit"
            type="checkbox"
            {...form.register('wantsAudit')}
            className="h-4 w-4 rounded border-gray-300 text-brand-sage focus:ring-brand-sage"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="wantsAudit" className="font-medium text-gray-800">Interested in a free AI business audit?</label>
        </div>
      </div>
      <div>
        <label htmlFor="learningGoal" className="block text-sm font-medium text-gray-800">One thing you want to learn (Optional)</label>
        <textarea
          id="learningGoal"
          rows={3}
          {...form.register('learningGoal')}
          className={`${fieldInputClass} min-h-[3.5rem]`}
        ></textarea>
      </div>
    </div>
  ];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center text-sm text-gray-300 mb-4">
        Step {currentStep + 1} of {stepsContent.length}
      </div>

      {stepsContent[currentStep]}

      <div className="flex flex-col-reverse md:flex-row md:justify-between mt-6 gap-4">
        <div className="md:w-1/3">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={onPrev}
              className="w-full inline-flex justify-center rounded-lg border border-transparent bg-gray-200 px-4 py-3 text-base font-medium text-gray-900 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm"
            >
              Previous
            </button>
          )}
        </div>
        <div className="md:w-1/3">
          {currentStep < stepsContent.length - 1 ? (
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-lg border border-transparent bg-brand-sage px-4 py-3 text-base font-medium text-gray-900 shadow-sm hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-sage sm:text-sm"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="w-full inline-flex justify-center rounded-lg border border-transparent bg-brand-sage px-4 py-3 text-base font-medium text-gray-900 shadow-sm hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-sage sm:text-sm"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Submitting...' : 'Submit RSVP'}
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-400 mt-4">
        By submitting this form, you consent to receive communications related to this event and your selected resources.
      </p>
    </form>
  );
}
