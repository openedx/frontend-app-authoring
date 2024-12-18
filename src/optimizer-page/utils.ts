import { LinkCheckResult } from './types';

const countBrokenLinks = (data: LinkCheckResult | null): number[] => {
  if (!data?.sections) {
    return [];
  }
  const counts: number[] = [];
  data.sections.forEach((section) => {
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
};

export default countBrokenLinks;
