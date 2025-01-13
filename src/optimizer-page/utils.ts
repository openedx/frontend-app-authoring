/* eslint-disable import/prefer-default-export */
import { LinkCheckResult } from './types';

export const countBrokenLinks = (data: LinkCheckResult | null):
{ brokenLinksCounts: number[], lockedLinksCounts: number[] } => {
  if (!data?.sections) {
    return { brokenLinksCounts: [], lockedLinksCounts: [] };
  }
  const brokenLinksCounts: number[] = [];
  const lockedLinksCounts: number[] = [];
  data.sections.forEach((section) => {
    let brokenLinks = 0;
    let lockedLinks = 0;
    section.subsections.forEach((subsection) => {
      subsection.units.forEach((unit) => {
        unit.blocks.forEach((block) => {
          brokenLinks += block.brokenLinks?.length || 0;
          lockedLinks += block.lockedLinks?.length || 0;
        });
      });
    });
    brokenLinksCounts.push(brokenLinks);
    lockedLinksCounts.push(lockedLinks);
  });
  return { brokenLinksCounts, lockedLinksCounts };
};
