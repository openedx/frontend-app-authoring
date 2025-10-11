import React, { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  Dropdown,
  Icon,
  Form,
  IconButton,
  Stack,
} from '@openedx/paragon';
import { AccessTime, ArrowForward, MoreHoriz } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { Link } from 'react-router-dom';

import { useWaffleFlags } from '@src/data/apiHooks';
import { COURSE_CREATOR_STATES } from '@src/constants';
import { parseLibraryKey } from '@src/generic/key-utils';
import classNames from 'classnames';
import { getStudioHomeData } from '../data/selectors';
import messages from '../messages';

const PrevToNextName = ({ from, to }: { from: React.ReactNode, to?: React.ReactNode }) => (
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

const MakeLinkOrSpan = ({
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
  itemId?: string;
  isMigrated?: boolean;
  migratedToKey?: string;
  migratedToTitle?: string;
}

const CardTitle: React.FC<CardTitleProps> = ({
  readOnlyItem,
  selectMode,
  destinationUrl,
  title,
  itemId,
  isMigrated,
  migratedToTitle,
  migratedToKey,
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
        to={
            isMigrated && migratedToTitle && (
              <MakeLinkOrSpan
                when={!readOnlyItem && !selectMode}
                to={`/library/${migratedToKey}`}
                className="card-item-title"
              >
                {migratedToTitle}
              </MakeLinkOrSpan>
            )
          }
      />
    </div>
  ), [
    readOnlyItem,
    isMigrated,
    destinationUrl,
    migratedToTitle,
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

interface BaseProps {
  displayName: string;
  org: string;
  number: string;
  run?: string;
  lmsLink?: string | null;
  rerunLink?: string | null;
  courseKey?: string;
  isLibraries?: boolean;
  isMigrated?: boolean;
  migratedToKey?: string;
  migratedToTitle?: string;
  migratedToCollectionKey?: string | null;
  selectMode?: 'single' | 'multiple';
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
const CardItem: React.FC<Props> = ({
  displayName,
  lmsLink = '',
  rerunLink = '',
  org,
  number,
  run = '',
  isLibraries = false,
  courseKey = '',
  selectMode,
  isSelected = false,
  itemId = '',
  path,
  url,
  isMigrated = false,
  migratedToKey,
  migratedToTitle,
  migratedToCollectionKey,
  scrollIntoView = false,
}) => {
  const intl = useIntl();
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
  const showActions = !(readOnlyItem || isLibraries);
  const isShowRerunLink = allowCourseReruns
    && rerunCreatorStatus
    && courseCreatorStatus === COURSE_CREATOR_STATES.granted;
  const title = (displayName ?? '').trim().length ? displayName : courseKey;

  const getSubtitle = useCallback(() => {
    let subtitle = isLibraries ? <>{org} / {number}</> : <>{org} / {number} / {run}</>;
    if (isMigrated && migratedToKey) {
      const migratedToKeyObj = parseLibraryKey(migratedToKey);
      subtitle = (
        <PrevToNextName
          from={subtitle}
          to={<>{migratedToKeyObj.org} / {migratedToKeyObj.lib}</>}
        />
      );
    }
    return subtitle;
  }, [isLibraries, org, number, run, migratedToKey, isMigrated]);

  const collectionLink = () => {
    let libUrl = `/library/${migratedToKey}`;
    if (migratedToCollectionKey) {
      libUrl += `/collection/${migratedToCollectionKey}`;
    }
    return libUrl;
  };

  useEffect(() => {
    /* istanbul ignore next */
    if (scrollIntoView && cardRef.current && 'scrollIntoView' in cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scrollIntoView]);

  return (
    <div ref={cardRef} className="w-100">
      <Card className={classNames('card-item', {
        selected: isSelected,
      })}
      >
        <Card.Header
          size="sm"
          title={(
            <CardTitle
              readOnlyItem={readOnlyItem}
              selectMode={selectMode}
              destinationUrl={destinationUrl}
              title={title}
              itemId={itemId}
              isMigrated={isMigrated}
              migratedToTitle={migratedToTitle}
              migratedToKey={migratedToKey}
            />
          )}
          subtitle={getSubtitle()}
          actions={showActions && (
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
                  {messages.btnReRunText.defaultMessage}
                </Dropdown.Item>
              )}
              <Dropdown.Item href={lmsLink}>
                {intl.formatMessage(messages.viewLiveBtnText)}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          )}
        />
        {isMigrated && migratedToKey
          && (
          <Card.Status className="bg-white pt-0 text-gray-500">
            <Stack direction="horizontal" gap={2}>
              <Icon src={AccessTime} size="sm" className="mb-1" />
              {intl.formatMessage(messages.libraryMigrationStatusText)}
              <b>
                <MakeLinkOrSpan
                  when={!readOnlyItem}
                  to={collectionLink()}
                  className="text-info-500"
                >
                  {migratedToTitle}
                </MakeLinkOrSpan>
              </b>
            </Stack>
          </Card.Status>
          )}
      </Card>
    </div>
  );
};

export default CardItem;
