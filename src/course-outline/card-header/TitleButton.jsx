import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  OverlayTrigger,
  Tooltip,
} from '@edx/paragon';
import {
  ArrowDropDown as ArrowDownIcon,
  ArrowDropUp as ArrowUpIcon,
} from '@edx/paragon/icons';
import messages from './messages';

const TitleButton = ({
  isExpanded,
  onTitleClick,
  namePrefix,
  children,
}) => {
  const intl = useIntl();
  const titleTooltipMessage = intl.formatMessage(messages.expandTooltip);

  return (
    <OverlayTrigger
      placement="bottom-start"
      overlay={(
        <Tooltip
          id={titleTooltipMessage}
          className="item-card-header-tooltip"
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
        {children}
      </Button>
    </OverlayTrigger>
  );
};

TitleButton.defaultProps = {
  children: null,
};

TitleButton.propTypes = {
  isExpanded: PropTypes.bool.isRequired,
  onTitleClick: PropTypes.func.isRequired,
  namePrefix: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default TitleButton;
