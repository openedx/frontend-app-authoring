import React, {
  ReactElement, useCallback, useEffect, useRef,
} from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  Dropdown,
  Icon,
  Form,
  IconButton,
  Stack,
} from '@openedx/paragon';
import { ArrowForward, MoreHoriz } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { Link } from 'react-router-dom';

import { useWaffleFlags } from '@src/data/apiHooks';
import { COURSE_CREATOR_STATES } from '@src/constants';
import classNames from 'classnames';
import { getStudioHomeData } from '../data/selectors';
import messages from '../messages';

export const PrevToNextName = ({ from, to }: { from: React.ReactNode, to?: React.ReactNode }) => (
  <Stack direction="horizontal" gap={2}>
    <span>{from}</span>
    {to
        && (
        <>
          <Icon src={ArrowForward} size="xs" className="mb-1" />
          <span>{to}</span>
        </>
        )}
  </Stack>
);

export const MakeLinkOrSpan = ({
  when, to, children, className,
}: {
  when: boolean,
  to: string,
  children: React.ReactNode;
  className?: string,
}) => {
  if (when) {
    return <Link className={className} to={to}>{children}</Link>;
  }
  return <span className={className}>{children}</span>;
};

interface CardTitleProps {
  readOnlyItem: boolean;
  selectMode?: 'single' | 'multiple';
  destinationUrl: string;
  title: string;
  secondaryLink?: ReactElement | null;
  itemId?: string;
}

const CardTitle: React.FC<CardTitleProps> = ({
  readOnlyItem,
  selectMode,
  destinationUrl,
  title,
  secondaryLink,
  itemId,
}) => {
  const getTitle = useCallback(() => (
    <div style={{ marginTop: selectMode ? '-3px' : '' }}>
      <PrevToNextName
        from={(
          <MakeLinkOrSpan
            when={!readOnlyItem && !selectMode}
            to={destinationUrl}
            className="card-item-title"
          >
            {title}
          </MakeLinkOrSpan>
          )}
        to={secondaryLink}
      />
    </div>
  ), [
    readOnlyItem,
    destinationUrl,
    title,
    selectMode,
  ]);

  if (selectMode) {
    if (selectMode === 'single') {
      return (
        <Form.Radio
          className="mt-1 ml-1"
          value={itemId}
          name={`select-card-item-${itemId}`}
          style={{ marginBottom: '-20px' }}
        >
          {getTitle()}
        </Form.Radio>
      );
    }
    // Multiple
    return (
      <Form.Checkbox
        className="mt-1 ml-1"
        value={itemId}
      >
        {getTitle()}
      </Form.Checkbox>
    );
  }
  return getTitle();
};

interface CardMenuProps {
  showMenu: boolean;
  isShowRerunLink?: boolean;
  rerunLink: string | null;
  lmsLink: string | null;
}

const CardMenu = ({
  showMenu,
  isShowRerunLink,
  rerunLink,
  lmsLink,
}: CardMenuProps) => {
  const intl = useIntl();

  if (!showMenu) {
    return null;
  }

  return (
    <Dropdown>
      <Dropdown.Toggle
        as={IconButton}
        iconAs={MoreHoriz}
        variant="primary"
        aria-label={intl.formatMessage(messages.btnDropDownText)}
      />
      <Dropdown.Menu>
        {isShowRerunLink && (
          <Dropdown.Item
            as={Link}
            to={rerunLink ?? ''}
          >
            <FormattedMessage {...messages.btnReRunText} />
          </Dropdown.Item>
        )}
        <Dropdown.Item href={lmsLink}>
          <FormattedMessage {...messages.viewLiveBtnText} />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

const SelectAction = ({
  itemId,
  title,
  selectMode,
}: {
  itemId: string,
  title: string,
  selectMode: 'single' | 'multiple';
}) => {
  if (selectMode === 'single') {
    return (
      <Form.Radio
        value={itemId}
        aria-label={title}
        name={`select-card-item-${itemId}`}
      />
    );
  }

  // Multiple
  return (
    <Form.Checkbox value={itemId} aria-label={title} />
  );
};

interface BaseProps {
  displayName: string;
  onClick?: () => void;
  org: string;
  number: string;
  run?: string;
  lmsLink?: string | null;
  rerunLink?: string | null;
  courseKey?: string;
  isLibraries?: boolean;
  subtitleWrapper?: ((subtitle: JSX.Element) => ReactElement) | null; // Wrapper for the default subtitle element
  subtitleBeforeWidget?: ReactElement | null; // Adds a widget before the default subtitle element
  cardStatusWidget?: ReactElement | null;
  titleSecondaryLink?: ReactElement | null;
  selectMode?: 'single' | 'multiple';
  selectPosition?: 'card' | 'title';
  isSelected?: boolean;
  itemId?: string;
  scrollIntoView?: boolean;
}

type Props = BaseProps & (
  /** If we should open this course/library in this MFE, this is the path to the edit page, e.g. '/course/foo' */
  { path: string, url?: never } |
  /**
   * If we might be redirecting to the legacy Studio view, this is the URL to redirect to.
   * URLs starting with '/' are assumed to be relative to the legacy Studio root.
   */
  { url: string, path?: never }
);

/**
 * A card on the Studio home page that represents a Course or a Library
 */
export const CardItem: React.FC<Props> = ({
  displayName,
  onClick,
  lmsLink = '',
  rerunLink = '',
  org,
  number,
  run = '',
  isLibraries = false,
  courseKey = '',
  selectMode,
  selectPosition,
  isSelected = false,
  itemId = '',
  path,
  url,
  subtitleWrapper,
  subtitleBeforeWidget,
  titleSecondaryLink,
  cardStatusWidget,
  scrollIntoView = false,
}) => {
  const {
    allowCourseReruns,
    courseCreatorStatus,
    rerunCreatorStatus,
  } = useSelector(getStudioHomeData);
  const waffleFlags = useWaffleFlags();
  const cardRef = useRef<HTMLDivElement>(null);

  const destinationUrl: string = path ?? (
    waffleFlags.useNewCourseOutlinePage && !isLibraries
      ? url
      : new URL(url, getConfig().STUDIO_BASE_URL).toString()
  );
  const readOnlyItem = !(lmsLink || rerunLink || url || path);
  const showActionsMenu = !(readOnlyItem || isLibraries || selectMode !== undefined);
  const isShowRerunLink = allowCourseReruns
    && rerunCreatorStatus
    && courseCreatorStatus === COURSE_CREATOR_STATES.granted;
  const title = (displayName ?? '').trim().length ? displayName : courseKey;

  const getSubtitle = useCallback(() => {
    let subtitle = isLibraries ? <>{org} / {number}</> : <>{org} / {number} / {run}</>;
    if (subtitleWrapper) {
      subtitle = subtitleWrapper(subtitle);
    }
    if (subtitleBeforeWidget) {
      subtitle = (
        <Stack direction="horizontal" gap={2}>
          {subtitleBeforeWidget}
          {subtitle}
        </Stack>
      );
    }
    return subtitle;
  }, [isLibraries, org, number, run]);

  useEffect(() => {
    /* istanbul ignore next */
    if (scrollIntoView && cardRef.current && 'scrollIntoView' in cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scrollIntoView]);

  return (
    <div ref={cardRef} className="w-100">
      <Card
        onClick={onClick}
        className={classNames('card-item', {
          selected: isSelected,
        })}
      >
        <Card.Header
          size="sm"
          title={(
            <CardTitle
              readOnlyItem={readOnlyItem || selectMode !== undefined}
              selectMode={selectPosition === 'title' ? selectMode : undefined}
              destinationUrl={destinationUrl}
              title={title}
              itemId={itemId}
              secondaryLink={titleSecondaryLink}
            />
          )}
          subtitle={getSubtitle()}
          actions={(selectMode && selectPosition === 'card') ? (
            <SelectAction
              itemId={itemId}
              selectMode={selectMode}
              title={title}
            />
          ) : (
            <CardMenu
              showMenu={showActionsMenu}
              isShowRerunLink={isShowRerunLink}
              rerunLink={rerunLink}
              lmsLink={lmsLink}
            />
          )}
        />
        {cardStatusWidget && (
          <Card.Status className="bg-white pt-0 text-gray-500">
            {cardStatusWidget}
          </Card.Status>
        )}
      </Card>
    </div>
  );
};
