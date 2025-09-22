'use client';

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const typographyVariants = cva(
  'transition-colors',
  {
    variants: {
      variant: {
        h1: 'text-4xl font-bold tracking-tight text-secondary-900 dark:text-neutral-100 lg:text-5xl',
        h2: 'text-3xl font-bold tracking-tight text-secondary-900 dark:text-neutral-100 lg:text-4xl',
        h3: 'text-2xl font-semibold tracking-tight text-secondary-900 dark:text-neutral-100 lg:text-3xl',
        h4: 'text-xl font-semibold tracking-tight text-secondary-900 dark:text-neutral-100 lg:text-2xl',
        h5: 'text-lg font-semibold tracking-tight text-secondary-900 dark:text-neutral-100',
        h6: 'text-base font-semibold tracking-tight text-secondary-900 dark:text-neutral-100',
        body: 'text-base text-neutral-700 dark:text-neutral-300',
        bodyLarge: 'text-lg text-neutral-700 dark:text-neutral-300',
        bodySmall: 'text-sm text-neutral-700 dark:text-neutral-300',
        muted: 'text-sm text-neutral-500 dark:text-neutral-400',
        small: 'text-xs text-neutral-500 dark:text-neutral-400',
        lead: 'text-xl text-neutral-600 dark:text-neutral-400',
        blockquote: 'border-l-4 border-primary-600 pl-4 italic text-neutral-600 dark:text-neutral-400',
        code: 'font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded border',
        gradient: 'bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent font-bold',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify',
      },
      weight: {
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
        extrabold: 'font-extrabold',
        black: 'font-black',
      },
    },
    defaultVariants: {
      variant: 'body',
      align: 'left',
      weight: 'normal',
    },
  }
);

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'blockquote' | 'code';
}

const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, align, weight, as, ...props }, ref) => {
    // Determine the HTML element based on variant if not explicitly provided
    const getElement = () => {
      if (as) return as;
      if (variant?.startsWith('h')) return variant as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      if (variant === 'blockquote') return 'blockquote';
      if (variant === 'code') return 'code';
      return 'p';
    };

    const Element = getElement();

    return (
      <Element
        ref={ref as any}
        className={cn(typographyVariants({ variant, align, weight, className }))}
        {...props}
      />
    );
  }
);

Typography.displayName = 'Typography';

// Convenience components for common use cases
const Heading1 = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="h1"
      className={className}
      {...props}
    />
  )
);
Heading1.displayName = 'Heading1';

const Heading2 = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="h2"
      className={className}
      {...props}
    />
  )
);
Heading2.displayName = 'Heading2';

const Heading3 = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="h3"
      className={className}
      {...props}
    />
  )
);
Heading3.displayName = 'Heading3';

const Body = forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="body"
      className={className}
      {...props}
    />
  )
);
Body.displayName = 'Body';

const Muted = forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="muted"
      className={className}
      {...props}
    />
  )
);
Muted.displayName = 'Muted';

const Small = forwardRef<HTMLSpanElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="small"
      className={className}
      {...props}
    />
  )
);
Small.displayName = 'Small';

const Lead = forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="lead"
      className={className}
      {...props}
    />
  )
);
Lead.displayName = 'Lead';

export { 
  Typography, 
  Heading1, 
  Heading2, 
  Heading3, 
  Body, 
  Muted, 
  Small, 
  Lead, 
  typographyVariants 
};

