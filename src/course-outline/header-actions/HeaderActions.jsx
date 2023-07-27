import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';
import {
  Add as IconAdd,
  ArrowDropDown as ArrowDownIcon,
} from '@edx/paragon/icons';

import messages from './messages';

const HeaderActions = ({
  onNewSections, onReindex, onExpandAll, onViewLive,
}) => {
  const intl = useIntl();

  return (
    <div className="header-actions ml-auto">
      <Button variant="primary" iconBefore={IconAdd} onClick={onNewSections}>
        {intl.formatMessage(messages.newSectionButton)}
      </Button>
      <Button variant="outline-primary" onClick={onReindex}>
        {intl.formatMessage(messages.reindexButton)}
      </Button>
      <Button variant="outline-primary" iconBefore={ArrowDownIcon} onClick={onExpandAll}>
        {intl.formatMessage(messages.expandAllButton)}
      </Button>
      <Button variant="outline-primary" onClick={onViewLive}>
        {intl.formatMessage(messages.viewLiveButton)}
      </Button>
    </div>
  );
};

HeaderActions.propTypes = {
  onNewSections: PropTypes.func.isRequired,
  onReindex: PropTypes.func.isRequired,
  onExpandAll: PropTypes.func.isRequired,
  onViewLive: PropTypes.func.isRequired,
};

export default HeaderActions;
