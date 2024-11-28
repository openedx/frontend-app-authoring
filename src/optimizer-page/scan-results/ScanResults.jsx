import {
  Container, Layout, Button, Card, Collapsible, Icon, Table,
} from '@openedx/paragon';
import { ArrowRight, ArrowDropDown } from '@openedx/paragon/icons';
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
  if (!data || !data.sections) {
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
          <h2 className="subsection-header">Subsection A</h2>
          <div className="unit">
            <h3 className="unit-header">Unit 1</h3>
            <div className="block">
              <p className="block-header">Block with broken Links</p>
              <Table
                data={[
                  {
                    blockLink: 'Go to Block',
                    brokenLink: 'https://broken.example.com',
                  },
                  {
                    blockLink: 'Go to Block',
                    brokenLink: 'https://broken.example.com',
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
          <h2 className="subsection-header">Subsection B</h2>
          <div className="unit">
            <h3 className="unit-header">Unit 1</h3>
            <div className="block">
              <p className="block-header">Block with broken Links</p>
              <Table
                data={[
                  {
                    blockLink: 'Go to Block',
                    brokenLink: 'https://broken.example.com',
                  },
                  {
                    blockLink: 'Go to Block',
                    brokenLink: 'https://broken.example.com',
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
          {/* {section.subsections.map((subsection) => (
            <p key={subsection.id}>
              <h3>{subsection.displayName}</h3>
              {subsection.units.map((unit) => (
                <p key={unit.id}>
                  <h4>{unit.displayName}</h4>
                  {unit.blocks.map((block) => (
                    <p key={block.id}>
                      <p>
                        <strong>URL:</strong>
                        {' '}
                        {block.url}
                      </p>
                      <p>
                        <strong>Broken Links:</strong>
                        {' '}
                        {block.brokenLinks.join(', ')}
                      </p>
                    </p>
                  ))}
                </p>
              ))}
            </p>
          ))} */}
        </SectionCollapsible>
      ))}
    </div>
  );
};

export default ScanResults;
