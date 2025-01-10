import { Icon, Table } from '@openedx/paragon';
import { OpenInNew, Lock, LinkOff } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { FC } from 'react';
import { Unit } from '../types';
import messages from './messages';
import LockedInfoIcon from './LockedInfoIcon';

const BrokenLinkHref: FC<{ href: string }> = ({ href }) => (
  <div className="broken-link-container">
    <a href={href} target="_blank" className="broken-link" rel="noreferrer">
      {href}
    </a>
  </div>
);

const GoToBlock: FC<{ block: { url: string } }> = ({ block }) => (
  <span style={{ display: 'flex', gap: '.5rem' }}>
    <Icon src={OpenInNew} />
    <a href={block.url} target="_blank" rel="noreferrer">
      Go to Block
    </a>
  </span>
);

interface BrokenLinkTableProps {
  unit: Unit;
  showLockedLinks: boolean;
}

type TableData = {
  blockLink: JSX.Element;
  brokenLink: JSX.Element;
  status: JSX.Element;
}[];

const BrokenLinkTable: FC<BrokenLinkTableProps> = ({
  unit,
  showLockedLinks,
}) => {
  const intl = useIntl();
  return (
    <>
      <p className="unit-header">{unit.displayName}</p>
      <Table
        data={unit.blocks.reduce(
          (
            acc: TableData,
            block,
          ) => {
            const blockBrokenLinks = block.brokenLinks.map((link) => ({
              blockLink: <GoToBlock block={block} />,
              blockDisplayName: block.displayName || '',
              brokenLink: <BrokenLinkHref href={link} />,
              status: (
                <span className="link-status-text">
                  <Icon src={LinkOff} className="broken-link-icon" />
                  <span>
                    {intl.formatMessage(messages.brokenLinkStatus)}
                  </span>
                </span>
              ),
            }));
            acc.push(...blockBrokenLinks);
            if (!showLockedLinks) {
              return acc;
            }

            const blockLockedLinks = block.lockedLinks.map((link) => ({
              blockLink: <GoToBlock block={block} />,
              blockDisplayName: block.displayName || '',
              brokenLink: <BrokenLinkHref href={link} />,
              status: (
                <span className="link-status-text">
                  <Icon src={Lock} className="lock-icon" />
                  {intl.formatMessage(messages.lockedLinkStatus)}{' '}
                  <LockedInfoIcon />
                </span>
              ),
            }));
            acc.push(...blockLockedLinks);
            return acc;
          },
          [],
        )}
        columns={[
          {
            key: 'blockDisplayName',
            columnSortable: false,
            width: 'col-3',
            hideHeader: true,
          },
          {
            key: 'blockLink',
            columnSortable: false,
            width: 'col-3',
            hideHeader: true,
          },
          {
            key: 'brokenLink',
            columnSortable: false,
            width: 'col-6',
            hideHeader: true,
          },
          {
            key: 'status',
            columnSortable: false,
            width: 'col-6',
            hideHeader: true,
          },
        ]}
      />
    </>
  );
};

export default BrokenLinkTable;
