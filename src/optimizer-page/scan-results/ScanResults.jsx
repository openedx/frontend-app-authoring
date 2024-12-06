import {
  Container, Layout, Button, Card, Collapsible, Icon, Table,
} from '@openedx/paragon';
import { ArrowRight, ArrowDropDown, OpenInNew } from '@openedx/paragon/icons';
import { useState, useCallback } from 'react';

const SectionCollapsible = ({
  title, children, redItalics, className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const styling = 'card-lg';
  const collapsibleTitle = (
    <div className={className}>
      <Icon src={isOpen ? ArrowDropDown : ArrowRight} className="open-arrow" /><strong>{title}</strong><span className="red-italics">{redItalics}</span>
    </div>
  );

  return (

    <div className={`section ${isOpen ? 'is-open' : ''}`}>
      <Collapsible
        styling={styling}
        title={<p><strong>{collapsibleTitle}</strong></p>}
        iconWhenClosed=""
        iconWhenOpen=""
        open={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      >
        <Collapsible.Body>
          {children}
        </Collapsible.Body>
      </Collapsible>
    </div>
  );
};

function getBaseUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.origin}`;
  } catch (error) {
    return null;
  }
}

const BrokenLinkHref = ({ href }) => (
  <div className="broken-link-container">
    <a href={href} target="_blank" className="broken-link" rel="noreferrer">{href}</a>
  </div>
);

const GoToBlock = ({ block }) => <span style={{ display: 'flex', gap: '.5rem' }}><Icon src={OpenInNew} /><a href={block.url} target="_blank" rel="noreferrer">Go to Block</a></span>;

const ScanResults = ({ data }) => {
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
    return (
      <Card className="mt-4">
        <h1>Scan Results</h1>
        <Container>
          <p>No data available</p>
        </Container>
      </Card>
    );
  }

  const { sections } = data;
  console.log('data: ', data);
  console.log('sections: ', sections);

  const brokenLinkCounts = countBrokenLinksPerSection();

  return (
    <div className="scan-results">
      <div className="border-bottom border-light-400 mb-3">
        <header className="sub-header-content"><h2 className="sub-header-content-title">Broken Links Scan</h2></header>
      </div>

      {sections?.map((section, index) => (
        <SectionCollapsible
          key={section.id}
          title={section.displayName}
          redItalics={`${brokenLinkCounts[index]} broken links`}
        >
          {section.subsections.map((subsection) => (
            <>
              <h2 className="subsection-header" style={{ marginBottom: '2rem' }}>{subsection.displayName}</h2>
              {subsection.units.map((unit) => (
                <div className="unit">
                  <p className="block-header">{unit.displayName}</p>
                  <Table
                    data={unit.blocks.reduce((acc, block) => {
                      const blockBrokenLinks = block.brokenLinks.map((link) => ({
                        blockLink: <GoToBlock block={block} />,
                        brokenLink: <BrokenLinkHref href={link} />,
                        status: 'Status: BROKEN ?',
                      }));
                      acc.push(...blockBrokenLinks);
                      const blockLockedLinks = block.lockedLinks.map((link) => ({
                        blockLink: <GoToBlock block={block} />,
                        brokenLink: <BrokenLinkHref href={link} />,
                        status: 'Status: LOCKED ?',
                      }));
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
