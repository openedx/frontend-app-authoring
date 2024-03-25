/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import { useClearRefinements } from 'react-instantsearch';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import messages from './messages';

/** @type {React.FC} */
const ClearFiltersButton = () => {
  const { refine, canRefine } = useClearRefinements();
  if (canRefine) {
    return (
      <Button variant="link" size="sm" onClick={refine}>
        <FormattedMessage {...messages['courseSearch.clearFilters']} />
      </Button>
    );
  }
  return null;
};

export default ClearFiltersButton;
