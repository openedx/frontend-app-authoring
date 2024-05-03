import PropTypes from 'prop-types';
import {
  Icon, Button, OverlayTrigger, Tooltip,
} from '@openedx/paragon';
import { Tag } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';

import messages from './messages';

const TagCount = ({ count, onClick }) => {
  const intl = useIntl();

  const renderContent = () => (
    <>
      <Icon className="mr-1 pt-1" src={Tag} />
      {count}
    </>
  );

  return (
    <div className={
      classNames('generic-tag-count d-flex', { 'zero-count': count === 0 })
    }
    >
      { onClick ? (
        <OverlayTrigger
          placement="top"
          overlay={(
            <Tooltip id={intl.formatMessage(messages.tooltipText)}>
              {intl.formatMessage(messages.tooltipText)}
            </Tooltip>
          )}
        >
          <Button variant="tertiary" onClick={onClick}>
            {renderContent()}
          </Button>
        </OverlayTrigger>

      )
        : renderContent()}
    </div>
  );
};

TagCount.defaultProps = {
  onClick: undefined,
};

TagCount.propTypes = {
  count: PropTypes.number.isRequired,
  onClick: PropTypes.func,
};

export default TagCount;
