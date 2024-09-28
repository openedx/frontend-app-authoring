/* eslint-disable import/prefer-default-export */
import React from 'react';
import { Collapsible } from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { LoadingSpinner } from '../../generic/Loading';
import { useXBlockOLX } from '../data/apiHooks';
import messages from './messages';

interface Props {
  usageKey: string;
}

export const ComponentAdvancedInfo: React.FC<Props> = ({ usageKey }) => {
  const intl = useIntl();
  const { data: olx, isLoading: isOLXLoading } = useXBlockOLX(usageKey);
  return (
    <Collapsible
      styling="basic"
      title={intl.formatMessage(messages.advancedDetailsTitle)}
    >
      <dl>
        <dt><FormattedMessage {...messages.advancedDetailsUsageKey} /></dt>
        <dd className="text-monospace small">{usageKey}</dd>
        <dt>OLX Source</dt>
        <dd>
          {
            olx ? <code className="micro">{olx}</code> : // eslint-disable-line
            isOLXLoading ? <LoadingSpinner /> : // eslint-disable-line
            <span>Error</span>
          }
        </dd>
      </dl>
    </Collapsible>
  );
};
