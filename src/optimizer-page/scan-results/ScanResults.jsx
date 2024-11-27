import {
  Container, Layout, Button, Card, Collapsible,
} from '@openedx/paragon';
import { useState, useCallback } from 'react';

const SectionCollapsible = ({ title, children, redItalics }) => {
  const styling = 'card-lg';
  const collapsibleTitle = (
    <div>
      <p><strong>{title}</strong><i className="red-italics">{redItalics}</i></p>
    </div>
  );

  return (
    <Collapsible
      styling={styling}
      title={<p><strong>{collapsibleTitle}</strong></p>}
    >
      {children}
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
    <>
      <div className="border-bottom border-light-400 mb-3">
        <header className="sub-header-content"><h2 className="sub-header-content-title">Broken Links Scan</h2></header>
      </div>

      {sections?.map((section, index) => (
        <SectionCollapsible className="mt-4" key={section.id} title={section.displayName} redItalics={`${brokenLinkCounts[index]} broken links`}>
          {section.subsections.map((subsection) => (
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
          ))}
        </SectionCollapsible>
      ))}
    </>
  );
};

export default ScanResults;
