'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';
import * as SliderPrimitive from '@radix-ui/react-slider';

const sliderVariants = cva('relative flex w-full touch-none select-none items-center', {
  variants: {
    size: {
      sm: 'h-4',
      md: 'h-5',
      lg: 'h-6',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const sliderTrackVariants = cva('relative w-full grow overflow-hidden rounded-full bg-secondary', {
  variants: {
    size: {
      sm: 'h-1',
      md: 'h-1.5',
      lg: 'h-2',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const sliderThumbVariants = cva(
  'block rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'size-3.5',
        md: 'size-4',
        lg: 'size-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

function Slider({
  className,
  size,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & VariantProps<typeof sliderVariants>) {
  return (
    <SliderPrimitive.Root data-slot="slider" className={cn(sliderVariants({ size }), className)} {...props}>
      <SliderPrimitive.Track data-slot="slider-track" className={cn(sliderTrackVariants({ size }))}>
        <SliderPrimitive.Range data-slot="slider-range" className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb data-slot="slider-thumb" className={cn(sliderThumbVariants({ size }))} />
    </SliderPrimitive.Root>
  );
}

export { Slider };
