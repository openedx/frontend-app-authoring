import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';
import {
  ArrowDropDown as ArrowDownIcon,
  ArrowRight as ArrowRightIcon,
} from '@openedx/paragon/icons';
import messages from './messages';

interface TitleButtonProps {
  title: string;
  prefixIcon?: React.ReactNode;
  isExpanded: boolean;
  onTitleClick: () => void;
  namePrefix: string;
}

const TitleButton = ({
  title,
  prefixIcon,
  isExpanded,
  onTitleClick,
  namePrefix,
}: TitleButtonProps) => {
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
        iconBefore={isExpanded ? ArrowDownIcon : ArrowRightIcon}
        variant="tertiary"
        data-testid={`${namePrefix}-card-header__expanded-btn`}
        className="item-card-header__title-btn"
        onClick={onTitleClick}
        title={title}
      >
        {prefixIcon}
        <span className={`${namePrefix}-card-title mb-0 truncate-1-line`}>
          {title}
        </span>
      </Button>
    </OverlayTrigger>
  );
};

export default TitleButton;
