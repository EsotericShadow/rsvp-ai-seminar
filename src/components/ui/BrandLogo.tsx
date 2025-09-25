'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BrandLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'dark' | 'minimal';
  showTagline?: boolean;
  showLocation?: boolean;
}

const BrandLogo = forwardRef<HTMLDivElement, BrandLogoProps>(
  ({ className, size = 'md', variant = 'default', showTagline = false, showLocation = false, ...props }, ref) => {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-lg',
      lg: 'text-2xl',
      xl: 'text-4xl',
    };

    const iconSizes = {
      sm: 'text-lg',
      md: 'text-2xl',
      lg: 'text-3xl',
      xl: 'text-5xl',
    };

    const variantClasses = {
      default: 'text-primary-600 dark:text-primary-400',
      white: 'text-white',
      dark: 'text-secondary-900 dark:text-neutral-100',
      minimal: 'text-neutral-700 dark:text-neutral-300',
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center space-x-2', className)}
        {...props}
      >
        {/* Logo Icon */}
        <div className={cn('flex-shrink-0', iconSizes[size])}>
          <span className="text-current">🌲</span>
        </div>

        {/* Brand Text */}
        <div className="flex flex-col">
          <div className={cn('font-bold leading-tight', sizeClasses[size], variantClasses[variant])}>
            Evergreen
          </div>
          
          {showTagline && (
            <div className={cn(
              'text-xs font-medium leading-tight',
              variant === 'white' ? 'text-white/80' : 'text-secondary-600 dark:text-secondary-400'
            )}>
              Web Solutions
            </div>
          )}

          {showLocation && (
            <div className={cn(
              'text-xs leading-tight',
              variant === 'white' ? 'text-white/60' : 'text-neutral-500 dark:text-neutral-400'
            )}>
              Terrace, BC
            </div>
          )}
        </div>
      </div>
    );
  }
);

BrandLogo.displayName = 'BrandLogo';

// Convenience component for header use
export const HeaderBrand = forwardRef<HTMLDivElement, Omit<BrandLogoProps, 'size' | 'variant'>>(
  ({ className, ...props }, ref) => (
    <BrandLogo
      ref={ref}
      size="lg"
      variant="white"
      showTagline={true}
      className={className}
      {...props}
    />
  )
);
HeaderBrand.displayName = 'HeaderBrand';

// Convenience component for footer use
export const FooterBrand = forwardRef<HTMLDivElement, Omit<BrandLogoProps, 'size' | 'variant'>>(
  ({ className, ...props }, ref) => (
    <BrandLogo
      ref={ref}
      size="md"
      variant="minimal"
      showTagline={true}
      showLocation={true}
      className={className}
      {...props}
    />
  )
);
FooterBrand.displayName = 'FooterBrand';

export { BrandLogo };








