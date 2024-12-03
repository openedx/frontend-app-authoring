import {
  Container, Layout, Button, Card, Collapsible, Icon, Table,
} from '@openedx/paragon';
import { ArrowRight, ArrowDropDown, OpenInNew } from '@openedx/paragon/icons';
import { useState, useCallback } from 'react';

const SectionCollapsible = ({ title, children, redItalics }) => {
  const [isOpen, setIsOpen] = useState(false);
  const styling = 'card-lg';
  const collapsibleTitle = (
    <div>
      <Icon src={isOpen ? ArrowDropDown : ArrowRight} className="open-arrow" /><strong>{title}</strong><span className="red-italics">{redItalics}</span>
    </div>
  );

  return (
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
  );
};

const ScanResults = ({ data }) => {
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

  if (!data.sections) {
    return (
      <Card className="mt-4">
        <h1>Scan Results</h1>
        <Container>
          <div><pre>{JSON.stringify(data, null, 2) }</pre></div>
        </Container>
      </Card>
    );
  }
  const { sections } = data;
  console.log('data: ', data);
  console.log('sections: ', sections);

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

  const brokenLinkCounts = countBrokenLinksPerSection();

  const blockLink = <span style={{ display: 'flex', gap: '.5rem' }}><Icon src={OpenInNew} /><a href="https://example.com" target="_blank" rel="noreferrer">Go to Block</a></span>;
  const brokenLink = <a href="https://broken.example.com" target="_blank" className="broken-link" rel="noreferrer">https://broken.example.com</a>;

  return (
    <div className="scan-results">
      <div className="border-bottom border-light-400 mb-3">
        <header className="sub-header-content"><h2 className="sub-header-content-title">Broken Links Scan</h2></header>
      </div>

      {sections?.map((section, index) => (
        <SectionCollapsible
          className="mt-4"
          key={section.id}
          title={section.displayName}
          redItalics={`${brokenLinkCounts[index]} broken links`}
        >
          <h2 className="subsection-header" style={{ marginBottom: '2rem' }}>Subsection A</h2>
          <div className="unit">
            <div className="block">
              <p className="block-header">Unit 1</p>
              <Table
                data={[
                  {
                    blockLink,
                    brokenLink,
                  },
                  {
                    blockLink,
                    brokenLink,
                  },

                ]}
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
                ]}
                // className="table-striped"
              />
            </div>
          </div>
          <div className="unit">
            <div className="block">
              <p className="block-header">Unit 2</p>
              <Table
                data={[
                  {
                    blockLink,
                    brokenLink,
                  },
                  {
                    blockLink,
                    brokenLink,
                  },

                ]}
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
                ]}
              />
            </div>
          </div>
        </SectionCollapsible>
      ))}
    </div>
  );
};

export default ScanResults;
