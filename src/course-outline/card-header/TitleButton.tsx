import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  OverlayTrigger,
  Tooltip,
  Truncate,
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
      >
        {prefixIcon}
        <Truncate.Deprecated lines={1} className={`${namePrefix}-card-title mb-0`}>{title}</Truncate.Deprecated>
      </Button>
    </OverlayTrigger>
  );
};

export default TitleButton;
