/* eslint-disable import/prefer-default-export */
import { LinkCheckResult } from './types';

export const countBrokenLinks = (
  data: LinkCheckResult | null,
): {
  brokenLinksCounts: number[];
  lockedLinksCounts: number[];
  externalForbiddenLinksCounts: number[];
} => {
  if (!data?.sections) {
    return {
      brokenLinksCounts: [],
      lockedLinksCounts: [],
      externalForbiddenLinksCounts: [],
    };
  }
  const brokenLinksCounts: number[] = [];
  const lockedLinksCounts: number[] = [];
  const externalForbiddenLinksCounts: number[] = [];
  data.sections.forEach((section) => {
    let brokenLinks = 0;
    let lockedLinks = 0;
    let externalForbiddenLinks = 0;
    section.subsections.forEach((subsection) => {
      subsection.units.forEach((unit) => {
        unit.blocks.forEach((block) => {
          brokenLinks += block.brokenLinks?.length || 0;
          lockedLinks += block.lockedLinks?.length || 0;
          externalForbiddenLinks += block.externalForbiddenLinks?.length || 0;
        });
      });
    });
    brokenLinksCounts.push(brokenLinks);
    lockedLinksCounts.push(lockedLinks);
    externalForbiddenLinksCounts.push(externalForbiddenLinks);
  });
  return { brokenLinksCounts, lockedLinksCounts, externalForbiddenLinksCounts };
};

export const isDataEmpty = (data: LinkCheckResult | null): boolean => {
  if (!data) {
    return true;
  }

  // Check sections
  if (data.sections && data.sections.length > 0) {
    const hasAnyLinks = data.sections.some(
      (section) => section.subsections.some(
        (subsection) => subsection.units.some(
          (unit) => unit.blocks.some(
            (block) => {
              const hasBrokenLinks = block.brokenLinks && block.brokenLinks.length > 0;
              const hasLockedLinks = block.lockedLinks && block.lockedLinks.length > 0;
              const hasExternalForbiddenLinks = block.externalForbiddenLinks
                      && block.externalForbiddenLinks.length > 0;
              const hasPreviousRunLinks = block.previousRunLinks
                      && block.previousRunLinks.length > 0;

              return (
                hasBrokenLinks
                      || hasLockedLinks
                      || hasExternalForbiddenLinks
                      || hasPreviousRunLinks
              );
            },
          ),
        ),
      ),
    );

    if (hasAnyLinks) {
      return false;
    }
  }

  // Check course updates
  if (data.courseUpdates && data.courseUpdates.length > 0) {
    const hasAnyLinks = data.courseUpdates.some((update) => (update.brokenLinks && update.brokenLinks.length > 0)
      || (update.lockedLinks && update.lockedLinks.length > 0)
      || (update.externalForbiddenLinks && update.externalForbiddenLinks.length > 0)
      || (update.previousRunLinks && update.previousRunLinks.length > 0));
    if (hasAnyLinks) {
      return false;
    }
  }

  // Check custom pages
  if (data.customPages && data.customPages.length > 0) {
    const hasAnyLinks = data.customPages.some((page) => (page.brokenLinks && page.brokenLinks.length > 0)
      || (page.lockedLinks && page.lockedLinks.length > 0)
      || (page.externalForbiddenLinks && page.externalForbiddenLinks.length > 0)
      || (page.previousRunLinks && page.previousRunLinks.length > 0));
    if (hasAnyLinks) {
      return false;
    }
  }

  return true;
};
