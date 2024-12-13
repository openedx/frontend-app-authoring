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

const LockedInfoIcon = () => {
  const intl = useIntl();

  return (
    <OverlayTrigger
      key="top"
      placement="top"
      overlay={(
        <Tooltip variant="light" id="tooltip-top">
          {intl.formatMessage(messages.lockedInfoTooltip)}
        </Tooltip>
    )}
    >
      <Icon src={Question} />
    </OverlayTrigger>
  );
};

const InfoCard = ({ text }) => (
  <Card className="mt-4">
    <h3
      className="subsection-header"
      style={{ margin: '1rem', textAlign: 'center' }}
    >
      {text}
    </h3>
  </Card>
);

const BrokenLinkTable = ({ unit }) => (
  <>
    <p className="block-header">{unit.displayName}</p>
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

const ScanResults = ({ data }) => {
  const intl = useIntl();
  const [showLockedLinks, setShowLockedLinks] = useState(true);

  const countBrokenLinksPerSection = useCallback(() => {
    const counts = [];
    sections.forEach((section) => {
      let count = 0;
      section.subsections.forEach((subsection) => {
        subsection.units.forEach((unit) => {
          unit.blocks.forEach((block) => {
            count += block.brokenLinks.length;
          });
        });
      });
      counts.push(count);
    });
    return counts;
  }, [data?.sections]);

  if (!data) {
    return <InfoCard text={intl.formatMessage(messages.noDataCard)} />;
  }
  if (!data.sections) {
    return <InfoCard text={intl.formatMessage(messages.noBrokenLinksCard)} />;
  }

  const { sections } = data;
  console.log('data: ', data);
  console.log('sections: ', sections);

  const brokenLinkCounts = countBrokenLinksPerSection();

  return (
    <div className="scan-results">
      <div className="border-bottom border-light-400 mb-3">
        <header className="sub-header-content">
          <h2 className="sub-header-content-title">{intl.formatMessage(messages.scanHeader)}</h2>
          <span className="locked-links-checkbox-wrapper">
            <CheckBox
              className="locked-links-checkbox"
              type="checkbox"
              checked={showLockedLinks}
              onClick={() => {
                setShowLockedLinks(!showLockedLinks);
              }}
              label={intl.formatMessage(messages.lockedCheckboxLabel)}
            />
            <LockedInfoIcon />
          </span>
        </header>
      </div>

      {sections?.map((section, index) => (
        <SectionCollapsible
          key={section.id}
          title={section.displayName}
          redItalics={intl.formatMessage(messages.brokenLinksNumber, { count: brokenLinkCounts[index] })}
        >
          {section.subsections.map((subsection) => (
            <>
              <h2
                className="subsection-header"
                style={{ marginBottom: '2rem' }}
              >
                {subsection.displayName}
              </h2>
              {subsection.units.map((unit) => (
                <div className="unit">
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
                </div>
              ))}
            </>
          ))}
        </SectionCollapsible>
      ))}
    </div>
  );
};

export default ScanResults;
