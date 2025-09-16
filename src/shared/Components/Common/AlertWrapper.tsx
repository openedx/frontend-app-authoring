import React from 'react';

import { Alert } from '@openedx/paragon';
import { CheckCircle } from '@openedx/paragon/icons';
import { AlertCircle } from '@untitledui/icons';

import { cn } from '../../lib/utils';

interface AlertWrapperProps {
  status: string;
  children: React.ReactNode;
}

const AlertWrapper = ({ status = 'danger', children }: AlertWrapperProps) => (
  <Alert
    id="validation-errors"
    className={cn(
      'tw-shadow-none tw-border-solid tw-border-[1px] tw-rounded-[8px] tw-p-[8px] tw-gap-[4px] tw-text-[14px] tw-font-[400]',
      status === 'complete' ? 'tw-text-success-700' : 'tw-text-error-700 tw-border-error-300 tw-bg-error-50',
    )}
    variant={`${status === 'complete' ? 'success' : 'danger'}`}
    icon={status === 'complete' ? CheckCircle : AlertCircle}
  >
    {children}
  </Alert>
);

export default AlertWrapper;
