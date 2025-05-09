import {
  Card, Icon, OverlayTrigger, DataTable, Tooltip,
} from '@openedx/paragon';
import {
  OpenInNew, Lock, LinkOff, InfoOutline,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { FC } from 'react';
import { Unit } from '../types';
import messages from './messages';
import LockedInfoIcon from './LockedInfoIcon';

const BrokenLinkHref: FC<{ href: string }> = ({ href }) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.open(href, '_blank');
  };

  return (
    <div className="broken-link-container">
      <a href={href} onClick={handleClick} className="broken-link" rel="noreferrer">
        {href}
      </a>
    </div>
  );
};

const GoToBlock: FC<{ block: { url: string } }> = ({ block }) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.open(block.url, '_blank');
  };

  return (
    <span style={{ display: 'flex', gap: '.5rem' }}>
      <Icon src={OpenInNew} />
      <a href={block.url} onClick={handleClick} rel="noreferrer">
        Go to Block
      </a>
    </span>
  );
};

const RecommendedManualCheckHeading = () => {
  const intl = useIntl();
  return (
    <span className="d-flex align-items-center font-weight-bold py-2">
      {intl.formatMessage(messages.recommendedManualCheckText)}
      <OverlayTrigger
        key="top"
        placement="top"
        overlay={(
          <Tooltip id="tooltip-top">
            {intl.formatMessage(messages.recommendedManualCheckTooltip)}
          </Tooltip>
            )}
      >
        <Icon className="ml-1 pl-1" src={InfoOutline} />
      </OverlayTrigger>
    </span>
  );
};

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
    <Card className="unit-card rounded-sm pt-2 pl-3 pr-4 mb-2.5">
      <p className="unit-header">{unit.displayName}</p>
      <DataTable
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

            if (showLockedLinks) {
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
            }

            if (block.externalForbiddenLinks?.length > 0) {
              const recommendedManualCheckHeading = {
                blockLink: <div />,
                blockDisplayName: <RecommendedManualCheckHeading />,
                brokenLink: <div />,
                status: <div />,
              };
              const externalForbiddenLinks = block.externalForbiddenLinks.map((link) => ({
                blockLink: <GoToBlock block={block} />,
                blockDisplayName: block.displayName || '',
                brokenLink: <BrokenLinkHref href={link} />,
                status: <div />,
              }));

              acc.push(recommendedManualCheckHeading);
              acc.push(...externalForbiddenLinks);
            }

            return acc;
          },
          [],
        )}
        columns={[
          {
            accessor: 'blockDisplayName',
            width: 'col-3',
          },
          {
            accessor: 'blockLink',
            width: 'col-3',
          },
          {
            accessor: 'brokenLink',
            width: 'col-6',
          },
          {
            accessor: 'status',
            width: 'col-6',
          },
        ]}
      />
    </Card>
  );
};

export default BrokenLinkTable;
