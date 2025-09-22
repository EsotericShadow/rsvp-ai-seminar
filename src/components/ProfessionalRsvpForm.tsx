'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { coreRsvpFormSchema, RsvpFormValues } from '@/lib/validators';
import { motion, AnimatePresence } from 'framer-motion';

// PhoneField component with professional styling
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
    <div className="flex items-center gap-2">
      <input
        id={`${id}-a`}
        inputMode="numeric"
        pattern="[0-9]*"
        value={a ?? ""}
        onChange={(e) => setPart("a", e.target.value, e.currentTarget)}
        onPaste={handlePaste}
        onBlur={onBlur}
        className="h-12 w-16 rounded-lg border-2 border-gray-200 bg-white px-3 text-center text-base font-medium text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-200"
        placeholder="555"
        aria-label="Area code"
      />
      <span className="text-lg text-gray-400 font-medium">-</span>
      <input
        id={`${id}-b`}
        inputMode="numeric"
        pattern="[0-9]*"
        value={b ?? ""}
        onChange={(e) => setPart("b", e.target.value, e.currentTarget)}
        onPaste={handlePaste}
        onBlur={onBlur}
        className="h-12 w-16 rounded-lg border-2 border-gray-200 bg-white px-3 text-center text-base font-medium text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-200"
        placeholder="123"
        aria-label="Prefix"
      />
      <span className="text-lg text-gray-400 font-medium">-</span>
      <input
        id={`${id}-c`}
        inputMode="numeric"
        pattern="[0-9]*"
        value={c ?? ""}
        onChange={(e) => setPart("c", e.target.value, e.currentTarget)}
        onPaste={handlePaste}
        onBlur={onBlur}
        className="h-12 w-20 rounded-lg border-2 border-gray-200 bg-white px-3 text-center text-base font-medium text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-200"
        placeholder="4567"
        aria-label="Line number"
      />
    </div>
  );
}

const steps = [
  { id: 'contact', title: 'Contact Information', description: 'Basic details to reserve your seat' },
  { id: 'attendance', title: 'Attendance Details', description: 'Confirm your attendance and guest count' },
  { id: 'preferences', title: 'Dietary & Accessibility', description: 'Help us accommodate your needs' },
  { id: 'referral', title: 'How did you hear about us?', description: 'Help us understand our reach' },
  { id: 'extras', title: 'Additional Information', description: 'Optional details to enhance your experience' }
];

export function ProfessionalRsvpForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(coreRsvpFormSchema),
    mode: 'onTouched',
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

  const fieldInputClass = 'mt-2 block w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all duration-200';
  const fieldLabelClass = 'block text-sm font-semibold text-gray-700 mb-1';

  const validateStep = async (idx: number) => {
    if (idx === 0) {
      return form.trigger(['firstName', 'lastName', 'email', 'phone'] as (keyof RsvpFormValues)[]);
    }
    if (idx === 1) {
      const keys: (keyof RsvpFormValues)[] = ['attendanceStatus'];
      if (form.getValues('attendanceStatus') === 'YES') keys.push('attendeeCount');
      return form.trigger(keys);
    }
    if (idx === 2) {
      const keys: (keyof RsvpFormValues)[] = ['dietaryPreference', 'accessibilityNeeds'];
      if (form.getValues('dietaryPreference') === 'OTHER') keys.push('dietaryOther');
      return form.trigger(keys);
    }
    if (idx === 3) {
      const keys: (keyof RsvpFormValues)[] = ['referralSource'];
      if (form.getValues('referralSource') === 'OTHER') keys.push('referralOther');
      return form.trigger(keys);
    }
    if (idx === 4) {
      return form.trigger(['wantsResources', 'wantsAudit', 'learningGoal'] as (keyof RsvpFormValues)[]);
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

  const onSubmit = async (data: RsvpFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus('success');
        form.reset();
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (submitStatus === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re all set!</h3>
        <p className="text-gray-600 mb-6">
          We&apos;ve reserved your seat for the AI in Northern BC Information Session. 
          You&apos;ll receive a confirmation email shortly.
        </p>
        <button
          onClick={() => {
            setSubmitStatus('idle');
            setCurrentStep(0);
          }}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
        >
          Submit Another RSVP
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
              index <= currentStep
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-white border-gray-300 text-gray-400'
            }`}>
              {index < currentStep ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="text-sm font-semibold">{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 transition-colors duration-300 ${
                index < currentStep ? 'bg-emerald-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h3>
            <p className="text-gray-600">
              {steps[currentStep].description}
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 0: Contact Information */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={fieldLabelClass}>
                      First Name *
                    </label>
                    <input
                      {...form.register('firstName')}
                      className={`${fieldInputClass} ${form.formState.errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
                      placeholder="Enter your first name"
                    />
                    {form.formState.errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={fieldLabelClass}>
                      Last Name *
                    </label>
                    <input
                      {...form.register('lastName')}
                      className={`${fieldInputClass} ${form.formState.errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
                      placeholder="Enter your last name"
                    />
                    {form.formState.errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={fieldLabelClass}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    {...form.register('email')}
                    className={`${fieldInputClass} ${form.formState.errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
                    placeholder="your.email@company.com"
                  />
                  {form.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className={fieldLabelClass}>
                    Phone Number *
                  </label>
                  <Controller
                    name="phone"
                    control={form.control}
                    render={({ field }) => (
                      <PhoneField
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  {form.formState.errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 1: Attendance Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className={fieldLabelClass}>
                    Will you be attending? *
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'YES', label: 'Yes, I&apos;ll be there', description: 'I&apos;m excited to attend' },
                      { value: 'MAYBE', label: 'Maybe', description: 'I&apos;m interested but not sure yet' },
                      { value: 'NO', label: 'No, I can&apos;t make it', description: 'I won&apos;t be able to attend' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-emerald-300 transition-colors duration-200">
                        <input
                          type="radio"
                          {...form.register('attendanceStatus')}
                          value={option.value}
                          className="mt-1 h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {form.formState.errors.attendanceStatus && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.attendanceStatus.message}</p>
                  )}
                </div>

                {form.watch('attendanceStatus') === 'YES' && (
                  <div>
                    <label className={fieldLabelClass}>
                      How many people will be attending? *
                    </label>
                    <select
                      {...form.register('attendeeCount')}
                      className={`${fieldInputClass} ${form.formState.errors.attendeeCount ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                      ))}
                    </select>
                    {form.formState.errors.attendeeCount && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.attendeeCount.message}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Dietary & Accessibility */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className={fieldLabelClass}>
                    Dietary Preferences
                  </label>
                  <select
                    {...form.register('dietaryPreference')}
                    className={fieldInputClass}
                  >
                    <option value="NONE">No dietary restrictions</option>
                    <option value="VEGETARIAN">Vegetarian</option>
                    <option value="VEGAN">Vegan</option>
                    <option value="GLUTEN_FREE">Gluten-free</option>
                    <option value="DAIRY_FREE">Dairy-free</option>
                    <option value="NUT_ALLERGY">Nut allergy</option>
                    <option value="OTHER">Other (please specify)</option>
                  </select>
                  {form.watch('dietaryPreference') === 'OTHER' && (
                    <input
                      {...form.register('dietaryOther')}
                      className={`${fieldInputClass} mt-3`}
                      placeholder="Please specify your dietary needs"
                    />
                  )}
                </div>

                <div>
                  <label className={fieldLabelClass}>
                    Accessibility Needs
                  </label>
                  <textarea
                    {...form.register('accessibilityNeeds')}
                    rows={3}
                    className={`${fieldInputClass} resize-none`}
                    placeholder="Please let us know if you have any accessibility needs we should be aware of"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Referral Source */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className={fieldLabelClass}>
                    How did you hear about this event? *
                  </label>
                  <select
                    {...form.register('referralSource')}
                    className={fieldInputClass}
                  >
                    <option value="WORD_OF_MOUTH">Word of mouth</option>
                    <option value="SOCIAL_MEDIA">Social media</option>
                    <option value="EMAIL">Email invitation</option>
                    <option value="WEBSITE">Evergreen Web Solutions website</option>
                    <option value="BUSINESS_NETWORK">Business network</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {form.watch('referralSource') === 'OTHER' && (
                    <input
                      {...form.register('referralOther')}
                      className={`${fieldInputClass} mt-3`}
                      placeholder="Please specify how you heard about us"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Additional Information */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <label className={fieldLabelClass}>
                    What would you like to learn about AI? (Optional)
                  </label>
                  <textarea
                    {...form.register('learningGoal')}
                    rows={4}
                    className={`${fieldInputClass} resize-none`}
                    placeholder="Tell us about your AI goals, challenges, or specific areas of interest..."
                  />
                </div>

                <div className="space-y-4">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      {...form.register('wantsResources')}
                      className="mt-1 h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      I&apos;d like to receive additional AI resources and updates from Evergreen Web Solutions
                    </span>
                  </label>

                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      {...form.register('wantsAudit')}
                      className="mt-1 h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      I&apos;m interested in a free AI readiness audit for my business
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onPrev}
                disabled={currentStep === 0}
                className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentStep === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500'
                }`}
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={onNext}
                  className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? 'Submitting...' : 'Complete RSVP'}
                </button>
              )}
            </div>

            {/* Error Message */}
            {submitStatus === 'error' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  There was an error submitting your RSVP. Please try again or contact us directly.
                </p>
              </div>
            )}
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

