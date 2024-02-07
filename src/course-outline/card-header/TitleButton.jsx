import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  OverlayTrigger,
  Tooltip,
  Truncate,
} from '@edx/paragon';
import {
  ArrowDropDown as ArrowDownIcon,
  ArrowDropUp as ArrowUpIcon,
} from '@edx/paragon/icons';
import messages from './messages';

const TitleButton = ({
  title,
  isExpanded,
  onTitleClick,
  namePrefix,
}) => {
  const intl = useIntl();
  const titleTooltipMessage = intl.formatMessage(messages.expandTooltip);

  return (
    <OverlayTrigger
      placement="bottom"
      overlay={(
        <Tooltip
          id={`${title}-${titleTooltipMessage}`}
        >
          {titleTooltipMessage}
        </Tooltip>
      )}
    >
      <Button
        iconBefore={isExpanded ? ArrowUpIcon : ArrowDownIcon}
        variant="tertiary"
        data-testid={`${namePrefix}-card-header__expanded-btn`}
        className="item-card-header__title-btn"
        onClick={onTitleClick}
      >
        <Truncate lines={1} className={`${namePrefix}-card-title mb-0`}>{title}</Truncate>
      </Button>
    </OverlayTrigger>
  );
};

TitleButton.propTypes = {
  title: PropTypes.string.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onTitleClick: PropTypes.func.isRequired,
  namePrefix: PropTypes.string.isRequired,
};

export default TitleButton;
