import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from 'shared/lib/utils';
import * as React from 'react';

interface SwitchOption<T> {
  label: React.ReactNode;
  value: T;
}

export interface SwitchProps<T>
  extends Omit<
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
  'value' | 'onValueChange' | 'checked' | 'onCheckedChange'
  > {
  readonly values: readonly [SwitchOption<T>, SwitchOption<T>];
  value: T;
  reverseOptions?: boolean;
  onValueChange: (value: T) => void;
}

const Switch = <T extends unknown>(
  {
    className, value, values, reverseOptions = false, onValueChange, ...props
  }: SwitchProps<T>,
  ref: React.ForwardedRef<React.ElementRef<typeof SwitchPrimitives.Root>>,
) => {
  const [uncheckedOption, checkedOption] = values;
  const isChecked = value === checkedOption.value;
  const handleCheckedChange = (checked: boolean) => {
    onValueChange(checked ? uncheckedOption.value : checkedOption.value);
  };

  return (
    <SwitchPrimitives.Root
      className={cn(
        'tw-group peer tw-h-[80px] tw-w-[48px] tw-inline-flex tw-px-0 tw-shrink-0 tw-cursor-pointer tw-items-center tw-justify-center tw-rounded-full tw-border-[1px] tw-border-brand-200 tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-0 focus-visible:tw-ring-offset-2 focus-visible:tw-ring-offset-white disabled:tw-cursor-not-allowed disabled:tw-opacity-50 data-[state=checked]:tw-bg-brand-50  data-[state=unchecked]:tw-bg-brand-50 dark:focus-visible:tw-ring-brand-400 dark:focus-visible:tw-ring-offset-neutral-950 dark:data-[state=checked]:tw-bg-brand-600 dark:data-[state=unchecked]:tw-bg-neutral-800 tw-relative',
        className,
      )}
      {...props}
      ref={ref}
      checked={reverseOptions ? !isChecked : isChecked}
      onCheckedChange={handleCheckedChange}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'tw-pointer-events-none tw-block tw-h-[40px] tw-w-[40px] tw-rounded-full tw-bg-white tw-ring-0 tw-transition-transform data-[state=checked]:-tw-translate-y-4 data-[state=unchecked]:tw-translate-y-4 dark:bg-neutral-950',
        )}
      />
      {uncheckedOption.label && (
        <span
          aria-hidden="true"
          className="tw-absolute tw-top-[12px] tw-text-grayWarm-900 tw-transition-opacity tw-duration-200 tw-opacity-100 group-data-[state=unchecked]:tw-text-grayWarm-500 tw-text-xs"
        >
          {uncheckedOption.label}
        </span>
      )}
      {checkedOption.label && (
        <span
          aria-hidden="true"
          className="tw-absolute tw-bottom-[12px] tw-text-grayWarm-500 tw-transition-opacity tw-duration-200 tw-opacity-100 group-data-[state=unchecked]:tw-text-grayWarm-900 tw-text-xs"
        >
          {checkedOption.label}
        </span>
      )}
    </SwitchPrimitives.Root>
  );
};

const ForwardedSwitch = React.forwardRef(Switch) as <T>(
  props: SwitchProps<T> & {
    ref?: React.ForwardedRef<React.ElementRef<typeof SwitchPrimitives.Root>>;
  },
) => React.ReactElement;

(ForwardedSwitch as React.FC).displayName = SwitchPrimitives.Root.displayName;

export { ForwardedSwitch as Switch };
