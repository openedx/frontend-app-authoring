import { LinkCheckResult, Section } from './types';

type FlatLinkCheckResult = NonNullable<LinkCheckResult['courseUpdates']>[number];

export const buildSyntheticSections = (
  courseUpdates: FlatLinkCheckResult[] | undefined,
  customPages: FlatLinkCheckResult[] | undefined,
  labels: { courseUpdates: string; customPages: string; },
): Section[] => {
  const buildSection = (
    items: FlatLinkCheckResult[] | undefined,
    sectionId: string,
    displayName: string,
  ): Section | null => {
    const itemsWithLinks = (items || []).filter(item =>
      (item.brokenLinks && item.brokenLinks.length > 0)
      || (item.lockedLinks && item.lockedLinks.length > 0)
      || (item.externalForbiddenLinks && item.externalForbiddenLinks.length > 0)
      || (item.previousRunLinks && item.previousRunLinks.length > 0)
    );

    if (itemsWithLinks.length === 0) { return null; }

    return {
      id: sectionId,
      displayName,
      subsections: [{
        id: `${sectionId}-subsection`,
        displayName: `${displayName} Subsection`,
        units: itemsWithLinks.map(item => ({
          id: item.id,
          displayName: item.displayName,
          url: item.url,
          blocks: [{
            id: item.id,
            displayName: item.displayName,
            url: item.url,
            brokenLinks: item.brokenLinks || [],
            lockedLinks: item.lockedLinks || [],
            externalForbiddenLinks: item.externalForbiddenLinks || [],
            previousRunLinks: item.previousRunLinks || [],
          }],
        })),
      }],
    };
  };

  return [
    buildSection(courseUpdates, 'course-updates', labels.courseUpdates),
    buildSection(customPages, 'custom-pages', labels.customPages),
  ].filter((section): section is Section => section !== null);
};

export const hasPreviousRunLinks = (sections: Section[]): boolean =>
  sections.some(section =>
    section.subsections.some(subsection =>
      subsection.units.some(unit =>
        unit.blocks.some(block => block.previousRunLinks && block.previousRunLinks.length > 0)
      )
    )
  );

export const countPreviousRunLinksBySection = (sections: Section[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  sections.forEach(section => {
    counts[section.id] = section.subsections.reduce(
      (sectionTotal, subsection) =>
        sectionTotal + subsection.units.reduce(
          (subsectionTotal, unit) =>
            subsectionTotal + unit.blocks.reduce(
              (unitTotal, block) => unitTotal + (block.previousRunLinks?.length || 0),
              0,
            ),
          0,
        ),
      0,
    );
  });
  return counts;
};

export const filterSectionsWithPreviousRunLinks = (sections: Section[]): Section[] =>
  sections.map(section => ({
    ...section,
    subsections: section.subsections.map(subsection => ({
      ...subsection,
      units: subsection.units.filter(unit => unit.blocks.some(block => block.previousRunLinks?.length > 0)),
    })).filter(subsection => subsection.units.length > 0),
  })).filter(section => section.subsections.length > 0);

export const areAllPreviousRunLinksUpdated = (sections: Section[], updatedLinkIds: string[]): boolean => {
  const updatedIds = new Set(updatedLinkIds);
  let hasLinks = false;

  const allUpdated = sections.every(section =>
    section.subsections.every(subsection =>
      subsection.units.every(unit =>
        unit.blocks.every(block =>
          block.previousRunLinks?.every(({ originalLink, isUpdated }) => {
            hasLinks = true;
            return isUpdated || updatedIds.has(`${block.id}:${originalLink}`);
          }) ?? true
        )
      )
    )
  );

  return hasLinks && allUpdated;
};

export const buildBlockContainerUrl = (
  courseId: string,
  unitId: string,
  blockId: string,
): string => {
  return `/course/${courseId}/container/${unitId}#${blockId}`;
};

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
      (section) =>
        section.subsections.some(
          (subsection) =>
            subsection.units.some(
              (unit) =>
                unit.blocks.some(
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
    const hasAnyLinks = data.courseUpdates.some((update) =>
      (update.brokenLinks && update.brokenLinks.length > 0)
      || (update.lockedLinks && update.lockedLinks.length > 0)
      || (update.externalForbiddenLinks && update.externalForbiddenLinks.length > 0)
      || (update.previousRunLinks && update.previousRunLinks.length > 0)
    );
    if (hasAnyLinks) {
      return false;
    }
  }

  // Check custom pages
  if (data.customPages && data.customPages.length > 0) {
    const hasAnyLinks = data.customPages.some((page) =>
      (page.brokenLinks && page.brokenLinks.length > 0)
      || (page.lockedLinks && page.lockedLinks.length > 0)
      || (page.externalForbiddenLinks && page.externalForbiddenLinks.length > 0)
      || (page.previousRunLinks && page.previousRunLinks.length > 0)
    );
    if (hasAnyLinks) {
      return false;
    }
  }

  return true;
};
