import { useIntl } from '@edx/frontend-platform/i18n';
import {
  IconButtonWithTooltip,
  Stack,
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
    <Stack direction="horizontal">
      <IconButtonWithTooltip
        src={isExpanded ? ArrowDownIcon : ArrowRightIcon}
        data-testid={`${namePrefix}-card-header__expanded-btn`}
        alt={title}
        tooltipContent={<div>{titleTooltipMessage}</div>}
        className="item-card-header__title-btn"
        onClick={onTitleClick}
        size="inline"
      />
      <div className="mr-2">
        {prefixIcon}
      </div>
      <span className={`${namePrefix}-card-title mb-0 truncate-1-line`}>
        {title}
      </span>
    </Stack>
  );
};

export default TitleButton;
