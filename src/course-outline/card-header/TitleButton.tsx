import { Link } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Hyperlink,
  Icon,
  OverlayTrigger,
  Stack,
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
  titleLink?: string;
}

const TitleButton = ({
  title,
  prefixIcon,
  isExpanded,
  onTitleClick,
  namePrefix,
  titleLink,
}: TitleButtonProps) => {
  const intl = useIntl();
  const titleTooltipMessage = intl.formatMessage(messages.expandTooltip);
  const ExpandIcon = isExpanded ? ArrowDownIcon : ArrowRightIcon;
  const titleText = (
    <span className={`${namePrefix}-card-title mb-0 truncate-1-line`}>
      {title}
    </span>
  );

  const handleExpandClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onTitleClick();
  };

  const stopTitleLinkPropagation = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const isExternalTitleLink = !!titleLink && /^[a-z][a-z\d+\-.]*:/i.test(titleLink);

  const titleLinkClassName = 'item-card-header__title-link-content min-width-0 flex-shrink-1 position-relative zindex-2 d-inline-flex align-items-center text-decoration-none';

  const linkedTitle = titleLink && (
    isExternalTitleLink ? (
      <Hyperlink
        className={titleLinkClassName}
        data-testid={`${namePrefix}-card-header__title-link`}
        destination={titleLink}
        isInline
        showLaunchIcon={false}
        onClick={stopTitleLinkPropagation}
        onMouseDown={stopTitleLinkPropagation}
      >
        {titleText}
      </Hyperlink>
    ) : (
      <Button
        as={Link}
        variant="tertiary"
        className={titleLinkClassName}
        data-testid={`${namePrefix}-card-header__title-link`}
        to={titleLink}
        onClick={stopTitleLinkPropagation}
        onMouseDown={stopTitleLinkPropagation}
      >
        {titleText}
      </Button>
    )
  );

  if (titleLink) {
    return (
      <OverlayTrigger
        placement="bottom"
        overlay={(
          <Tooltip id={`${title}-${titleTooltipMessage}`}>
            {titleTooltipMessage}
          </Tooltip>
        )}
      >
        <Stack
          direction="horizontal"
          className="item-card-header__title-btn item-card-header__title-btn--with-link align-items-center position-relative rounded-pill"
        >
          <Button
            type="button"
            variant="tertiary"
            className="item-card-header__title-expand-btn position-absolute w-100 h-100 p-0 border-0 bg-transparent"
            data-testid={`${namePrefix}-card-header__expanded-btn`}
            aria-expanded={isExpanded}
            aria-label={titleTooltipMessage}
            onClick={handleExpandClick}
          >
            <span className="sr-only">{titleTooltipMessage}</span>
          </Button>
          <Icon
            src={ExpandIcon}
            className="flex-shrink-0 mr-1 position-relative zindex-1"
          />
          {prefixIcon}
          {linkedTitle}
        </Stack>
      </OverlayTrigger>
    );
  }

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
        iconBefore={ExpandIcon}
        variant="tertiary"
        data-testid={`${namePrefix}-card-header__expanded-btn`}
        className="item-card-header__title-btn"
        onClick={onTitleClick}
        title={title}
      >
        {prefixIcon}
        {titleText}
      </Button>
    </OverlayTrigger>
  );
};

export default TitleButton;
