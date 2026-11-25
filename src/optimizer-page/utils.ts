import { LinkCheckResult, Section } from './types';

type FlatLinkCheckResult = NonNullable<LinkCheckResult['courseUpdates']>[number];

/**
 * Builds sections for course updates and custom pages that contain link issues.
 *
 * @param courseUpdates - Course updates found by the link checker.
 * @param customPages - Custom pages found by the link checker.
 * @param labels - Names to display for each section.
 * @returns Sections containing items with link issues.
 */
export const buildSyntheticSections = (
  courseUpdates: FlatLinkCheckResult[] | undefined,
  customPages: FlatLinkCheckResult[] | undefined,
  labels: { courseUpdates: string; customPages: string; },
): Section[] => {
  /**
   * Builds one section when at least one item has a link issue.
   *
   * @param items - Items to put in the section.
   * @param sectionId - ID for the section.
   * @param displayName - Name to display for the section.
   * @returns A section with link issues, or null when there are none.
   */
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

/**
 * Checks whether any block has links left over from a previous run.
 *
 * @param sections - Sections to search.
 * @returns True when at least one previous-run link exists.
 */
export const hasPreviousRunLinks = (sections: Section[]): boolean =>
  sections.some(section =>
    section.subsections.some(subsection =>
      subsection.units.some(unit =>
        unit.blocks.some(block => block.previousRunLinks && block.previousRunLinks.length > 0)
      )
    )
  );

/**
 * Counts previous-run links in each section.
 *
 * @param sections - Sections to count.
 * @returns A map from section ID to previous-run link count.
 */
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

/**
 * Keeps only units and sections that contain previous-run links.
 *
 * @param sections - Sections to filter.
 * @returns Sections containing previous-run links.
 */
export const filterSectionsWithPreviousRunLinks = (sections: Section[]): Section[] =>
  sections.map(section => ({
    ...section,
    subsections: section.subsections.map(subsection => ({
      ...subsection,
      units: subsection.units.filter(unit => unit.blocks.some(block => block.previousRunLinks?.length > 0)),
    })).filter(subsection => subsection.units.length > 0),
  })).filter(section => section.subsections.length > 0);

/**
 * Checks whether every previous-run link has been updated.
 *
 * @param sections - Sections containing previous-run links.
 * @param updatedLinkIds - IDs of links updated during the current run.
 * @returns True when there are links and all of them are updated.
 */
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

/**
 * Builds the Studio URL for a block inside a unit.
 *
 * @param courseId - ID of the course.
 * @param unitId - ID of the unit.
 * @param blockId - ID of the block.
 * @returns The URL for the block's container.
 */
export const buildBlockContainerUrl = (
  courseId: string,
  unitId: string,
  blockId: string,
): string => {
  return `/course/${courseId}/container/${unitId}#${blockId}`;
};

/**
 * Counts broken, locked, and forbidden external links in each section.
 *
 * @param data - Link-check results, or null when no results are available.
 * @returns Three arrays containing the counts for each section.
 */
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

/**
 * Checks whether the link-check results contain any link issues.
 *
 * @param data - Link-check results, or null when no results are available.
 * @returns True when no link issues are present.
 */
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
