import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';

import { ChevronRight } from '@untitledui/icons';
import { cn } from '../../lib/utils';
import { Button } from './button';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
React.ElementRef<typeof AccordionPrimitive.Item>,
React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('tw-border-b', className)}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
React.ElementRef<typeof AccordionPrimitive.Trigger>,
React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="tw-flex tw-mb-0">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'tw-flex tw-flex-1 tw-items-center tw-justify-between tw-py-4 tw-text-sm tw-font-medium tw-transition-all hover:tw-underline tw-text-left [&[data-state=open]_svg]:tw-rotate-90',
        className,
      )}
      {...props}
    >
      {children}
      <Button variant="ghost" size="icon" className="tw-rounded-[6px] tw-border-none !tw-size-6 tw-bg-[linear-gradient(180deg,#F9FAFB,#E7EBEF)] tw-shadow-xs">
        <ChevronRight className="tw-h-4 tw-w-4 tw-shrink-0 tw-text-muted-foreground tw-transition-transform tw-duration-200" />
      </Button>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
React.ElementRef<typeof AccordionPrimitive.Content>,
React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="tw-overflow-hidden tw-text-sm data-[state=closed]:tw-animate-accordion-up data-[state=open]:tw-animate-accordion-down"
    {...props}
  >
    <div className={cn('tw-pb-4 tw-pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
