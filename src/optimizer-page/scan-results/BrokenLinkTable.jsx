import { useState, useCallback } from 'react';
import {
  Card,
  Icon,
  Table,
  CheckBox,
  OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';
import {
  OpenInNew,
  Question,
  Lock,
  LinkOff,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import SectionCollapsible from '../SectionCollapsible';
import LockedInfoIcon from './LockedInfoIcon';

const BrokenLinkHref = ({ href }) => (
  <div className="broken-link-container">
    <a href={href} target="_blank" className="broken-link" rel="noreferrer">
      {href}
    </a>
  </div>
);

const GoToBlock = ({ block }) => (
  <span style={{ display: 'flex', gap: '.5rem' }}>
    <Icon src={OpenInNew} />
    <a href={block.url} target="_blank" rel="noreferrer">
      Go to Block
    </a>
  </span>
);

const BrokenLinkTable = ({ unit, showLockedLinks }) => {
  const intl = useIntl();
  return (
    <>
      <p className="unit-header">{unit.displayName}</p>
      <Table
        data={unit.blocks.reduce((acc, block) => {
          const blockBrokenLinks = block.brokenLinks.map(
            (link) => ({
              blockLink: <GoToBlock block={block} />,
              brokenLink: <BrokenLinkHref href={link} />,
              status: (
                <span className="link-status-text">
                  <Icon
                    src={LinkOff}
                    className="broken-link-icon"
                  />
                  {intl.formatMessage(messages.brokenLinkStatus)}
                </span>
              ),
            }),
          );
          acc.push(...blockBrokenLinks);
          if (!showLockedLinks) {
            return acc;
          }

          const blockLockedLinks = block.lockedLinks.map(
            (link) => ({
              blockLink: <GoToBlock block={block} />,
              brokenLink: <BrokenLinkHref href={link} />,
              status: (
                <span className="link-status-text">
                  <Icon src={Lock} className="lock-icon" />
                  {intl.formatMessage(messages.lockedLinkStatus)} <LockedInfoIcon />
                </span>
              ),
            }),
          );
          acc.push(...blockLockedLinks);
          return acc;
        }, [])}
        columns={[
          {
            key: 'blockLink',
            columnSortable: true,
            onSort: () => {},
            width: 'col-3',
            hideHeader: true,
          },
          {
            key: 'brokenLink',
            columnSortable: false,
            onSort: () => {},
            width: 'col-6',
            hideHeader: true,
          },
          {
            key: 'status',
            columnSortable: false,
            onSort: () => {},
            width: 'col-6',
            hideHeader: true,
          },
        ]}
      />
    </>
  );
};

export default BrokenLinkTable;
