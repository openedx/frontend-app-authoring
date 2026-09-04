import {
  useEffect,
  useState,
  useMemo,
  FC,
  useCallback,
} from 'react';
import {
  Chip,
  Button,
  Icon,
  useCheckboxSetValues,
  useToggle,
  StatefulButton,
} from '@openedx/paragon';
import {
  ArrowDropDown,
  CloseSmall,
  SpinnerSimple,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import AlertMessage from '@src/generic/alert-message';
import messages from './messages';
import SectionCollapsible from './SectionCollapsible';
import BrokenLinkTable from './BrokenLinkTable';
import type { LinkCheckResult, Section } from '../types';
import type { RerunLinkUpdateStatusData } from '../data/apiHooks';
import { countBrokenLinks, isDataEmpty } from '../utils';
import FilterModal from './filterModal';
import { useWaffleFlags } from '../../data/apiHooks';
import {
  useRerunLinkUpdateStatus,
  useUpdateAllPreviousRunLinks,
  useUpdateSinglePreviousRunLink,
} from '../data/apiHooks';
import { STATEFUL_BUTTON_STATES } from '../../constants';
import {
  RERUN_LINK_UPDATE_IN_PROGRESS_STATUSES,
  RERUN_LINK_UPDATE_STATUSES,
} from '../data/constants';

type FlatLinkCheckResult = NonNullable<LinkCheckResult['courseUpdates']>[number];

interface Props {
  data: LinkCheckResult | null;
  courseId: string;
  /** Kept for callers that still surface operation errors outside this component. */
  onErrorStateChange?: (errorMessage: string | null) => void;
}

const ScanResults: FC<Props> = ({
  data,
  courseId,
  onErrorStateChange,
}) => {
  const intl = useIntl();
  const waffleFlags = useWaffleFlags();
  const [isUpdateAllInProgress, setIsUpdateAllInProgress] = useState(false);
  const rerunLinkUpdateStatusQuery = useRerunLinkUpdateStatus(courseId, {
    enabled: waffleFlags.enableCourseOptimizerCheckPrevRunLinks,
  });
  const updateAllPreviousRunLinksMutation = useUpdateAllPreviousRunLinks(courseId);
  const updateSinglePreviousRunLinkMutation = useUpdateSinglePreviousRunLink(courseId);
  const rerunLinkUpdateResult = rerunLinkUpdateStatusQuery.data;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const reportError = useCallback((message: string) => {
    setErrorMessage(message);
    onErrorStateChange?.(message);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [onErrorStateChange]);
  useEffect(() => {
    if (rerunLinkUpdateStatusQuery.isError) {
      reportError(intl.formatMessage(messages.updateLinksError));
    }
  }, [intl, reportError, rerunLinkUpdateStatusQuery.isError]);
  const serverRerunLinkUpdateInProgress = rerunLinkUpdateResult?.status != null
    && RERUN_LINK_UPDATE_IN_PROGRESS_STATUSES.includes(rerunLinkUpdateResult.status);
  const rerunLinkUpdateInProgress = updateAllPreviousRunLinksMutation.isPending
    || isUpdateAllInProgress
    || serverRerunLinkUpdateInProgress;
  const [isOpen, open, close] = useToggle(false);
  const [updatedLinkIds, setUpdatedLinkIds] = useState<string[]>([]);
  const [updatedLinkMap, setUpdatedLinkMap] = useState<Record<string, string>>({});
  const [updatingLinkIds, setUpdatingLinkIds] = useState<Record<string, boolean>>({});
  const [updateAllTrigger, setUpdateAllTrigger] = useState(0);
  const [processedResponseIds, setProcessedResponseIds] = useState<Set<string>>(new Set());
  const initialFilters = {
    brokenLinks: false,
    lockedLinks: false,
    externalForbiddenLinks: false,
  };
  const [filters, setFilters] = useState(initialFilters);
  const [openStates, setOpenStates] = useState<boolean[]>([]);
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);
  const [prevRunOpenStates, setPrevRunOpenStates] = useState<boolean[]>([]);
  const { sections } = data || {};

  const renderableSections = useMemo(() => {
    const buildSectionData = (
      items: FlatLinkCheckResult[],
      sectionId: string,
      messageKey: keyof typeof messages,
    ) => {
      const itemsWithLinks = items.filter(item =>
        (item.brokenLinks && item.brokenLinks.length > 0)
        || (item.lockedLinks && item.lockedLinks.length > 0)
        || (item.externalForbiddenLinks && item.externalForbiddenLinks.length > 0)
        || (item.previousRunLinks && item.previousRunLinks.length > 0)
      );

      if (itemsWithLinks.length === 0) { return null; }

      return {
        id: sectionId,
        displayName: intl.formatMessage(messages[messageKey]),
        subsections: [{
          id: `${sectionId}-subsection`,
          displayName: `${intl.formatMessage(messages[messageKey])} Subsection`,
          units: itemsWithLinks.map(item => {
            const blockId = item.id;

            return {
              id: item.id,
              displayName: item.displayName,
              url: item.url,
              blocks: [{
                id: blockId,
                displayName: item.displayName,
                url: item.url,
                brokenLinks: item.brokenLinks || [],
                lockedLinks: item.lockedLinks || [],
                externalForbiddenLinks: item.externalForbiddenLinks || [],
                previousRunLinks: item.previousRunLinks || [],
              }],
            };
          }),
        }],
      };
    };

    const rSections: Section[] = [];

    if (data?.courseUpdates && data.courseUpdates.length > 0) {
      const courseUpdatesSection = buildSectionData(data.courseUpdates, 'course-updates', 'courseUpdatesHeader');
      if (courseUpdatesSection) {
        rSections.push(courseUpdatesSection);
      }
    }

    if (data?.customPages && data.customPages.length > 0) {
      const customPagesSection = buildSectionData(
        data.customPages,
        'custom-pages',
        'customPagesHeader',
      );
      if (customPagesSection) {
        rSections.push(customPagesSection);
      }
    }

    return rSections;
  }, [data?.courseUpdates, data?.customPages, intl]);

  // Combine renderable sections with regular sections
  const allSections: Section[] = useMemo(
    () => [...renderableSections, ...(sections || [])],
    [renderableSections, sections],
  );

  const {
    brokenLinksCounts,
    lockedLinksCounts,
    externalForbiddenLinksCounts,
  } = useMemo(() => countBrokenLinks({ sections: allSections }), [allSections]);

  // Calculate if there are any previous run links across all sections
  const hasPreviousRunLinks = useMemo(
    () =>
      allSections.some(section => (
        section.subsections.some(subsection =>
          subsection.units.some(unit => (
            unit.blocks.some(block => block.previousRunLinks && block.previousRunLinks.length > 0)
          ))
        )
      )),
    [allSections],
  );

  // Calculate previous run links count for each section
  const previousRunLinksCounts = useMemo(() => {
    if (!allSections) { return {}; }

    const linksCountMap = {};
    allSections.forEach(section => {
      let sectionTotal = 0;

      (section.subsections || []).forEach(subsection => {
        (subsection.units || []).forEach(unit => {
          (unit.blocks || []).forEach(block => {
            sectionTotal += block.previousRunLinks ? block.previousRunLinks.length : 0;
          });
        });
      });

      linksCountMap[section.id] = sectionTotal;
    });

    return linksCountMap;
  }, [allSections]);

  const activeFilters = Object.keys(filters).filter(key => filters[key]);
  const [filterBy, {
    add,
    remove,
    set,
    clear,
  }] = useCheckboxSetValues(activeFilters);

  useEffect(() => {
    setOpenStates(allSections ? allSections.map(() => false) : []);
    setPrevRunOpenStates(allSections ? allSections.map(() => false) : []);
  }, [allSections]);

  const processUpdateResults = useCallback((response: RerunLinkUpdateStatusData, isBulkUpdate = false) => {
    if (
      response.status === RERUN_LINK_UPDATE_STATUSES.SUCCEEDED
      && (isBulkUpdate || response.results.length > 4)
    ) {
      const successfulLinkIds: string[] = [];
      const newMap: Record<string, string> = {};

      const typeToSection: Record<string, string> = {
        course_updates: 'course-updates',
        custom_pages: 'custom-pages',
      };

      const blocksWithResults = new Set<string>();

      const addBlocksWithPrevLinks = (sectionId: string) => {
        const section = allSections.find(s => s.id === sectionId);
        if (!section) { return; }
        section.subsections.forEach(sub =>
          sub.units.forEach(unit =>
            unit.blocks.forEach(b => {
              if (b.previousRunLinks?.length) { blocksWithResults.add(b.id); }
            })
          )
        );
      };

      if (Array.isArray(response.results)) {
        response.results.forEach((result) => {
          const sectionId = typeToSection[result.type];
          if (sectionId) {
            addBlocksWithPrevLinks(sectionId);
          } else if (result.id) {
            blocksWithResults.add(result.id);
          }
        });
      }

      const allBlocksMap = new Map();
      allSections.forEach(section => {
        section.subsections.forEach(subsection => {
          subsection.units.forEach(unit => {
            unit.blocks.forEach(block => {
              if (block.previousRunLinks && block.previousRunLinks.length > 0) {
                allBlocksMap.set(block.id, {
                  block,
                  sectionId: section.id,
                  previousRunLinks: block.previousRunLinks,
                });
              }
            });
          });
        });
      });

      const blockIdMapping = new Map();

      if (response.results && Array.isArray(response.results)) {
        response.results.forEach(result => {
          const apiBlockId = result.id;
          const contentType = result.type;

          if (allBlocksMap.has(apiBlockId)) {
            blockIdMapping.set(apiBlockId, apiBlockId);
            return;
          }

          if (contentType === 'course_updates' || contentType === 'custom_pages') {
            const expectedSectionId = contentType === 'course_updates' ? 'course-updates' : 'custom-pages';

            allSections.forEach(section => {
              if (section.id === expectedSectionId) {
                section.subsections.forEach(subsection => {
                  subsection.units.forEach(unit => {
                    unit.blocks.forEach(block => {
                      if (
                        block.previousRunLinks
                        && block.previousRunLinks.length > 0
                        && !blockIdMapping.has(apiBlockId)
                      ) {
                        blockIdMapping.set(apiBlockId, block.id);
                      }
                    });
                  });
                });
              }
            });
          }
        });
      }

      if (response.results && Array.isArray(response.results)) {
        response.results.forEach((result) => {
          const apiBlockId = result.id;
          const uiBlockId = blockIdMapping.get(apiBlockId) || apiBlockId;
          const blockData = allBlocksMap.get(uiBlockId);

          if (blockData) {
            const newUrl = result.newUrl;

            if (result.success && newUrl && result.originalUrl) {
              const matchingLink = blockData.previousRunLinks.find(
                ({ originalLink }) => originalLink === result.originalUrl,
              );

              if (matchingLink) {
                const uid = `${uiBlockId}:${matchingLink.originalLink}`;
                successfulLinkIds.push(uid);
                newMap[uid] = newUrl;
              }
            }
          }
        });
      }

      setUpdatedLinkIds(currentIds => {
        const preservedIds: string[] = [];
        const newSuccessfulSet = new Set(successfulLinkIds);

        currentIds.forEach(existingId => {
          if (newSuccessfulSet.has(existingId)) {
            return;
          }

          preservedIds.push(existingId);
        });

        const result = [...successfulLinkIds, ...preservedIds];
        return result;
      });

      setUpdatedLinkMap(currentMap => {
        const preservedMap: Record<string, string> = {};
        const newSuccessfulSet = new Set(successfulLinkIds);

        Object.keys(currentMap).forEach(existingId => {
          if (newSuccessfulSet.has(existingId)) {
            return;
          }

          preservedMap[existingId] = currentMap[existingId];
        });

        const result = { ...preservedMap, ...newMap };
        return result;
      });

      return;
    }

    if (response.results && Array.isArray(response.results)) {
      const successfulResults = response.results.filter(r => r.success);
      if (successfulResults.length === 0) {
        return;
      }

      const successfulLinkIds: string[] = [];
      const newMap: Record<string, string> = {};

      allSections.forEach(section => {
        section.subsections.forEach(subsection => {
          subsection.units.forEach(unit => {
            unit.blocks.forEach(block => {
              if (block.previousRunLinks) {
                block.previousRunLinks.forEach(({ originalLink }) => {
                  const uid = `${block.id}:${originalLink}`;

                  const exactMatch = successfulResults.find(
                    result => result.id === block.id && result.originalUrl === originalLink,
                  );

                  if (exactMatch && exactMatch.newUrl) {
                    successfulLinkIds.push(uid);
                    newMap[uid] = exactMatch.newUrl;
                  }
                });
              }
            });
          });
        });
      });

      setUpdatedLinkIds(prev => {
        const combined = [...prev, ...successfulLinkIds];
        const deduped = combined.filter((item, index) => combined.indexOf(item) === index);

        return deduped;
      });
      if (Object.keys(newMap).length > 0) {
        setUpdatedLinkMap(prev => {
          const updated = { ...prev, ...newMap };
          return updated;
        });
      }
    }
  }, [allSections]);

  // Process terminal results after the optimistic Pending cache entry has been replaced.
  useEffect(() => {
    if (
      !isUpdateAllInProgress
      || updateAllPreviousRunLinksMutation.isPending
      || rerunLinkUpdateStatusQuery.isFetching
      || !rerunLinkUpdateResult
      || rerunLinkUpdateResult.status === RERUN_LINK_UPDATE_STATUSES.PENDING
      || rerunLinkUpdateResult.status === RERUN_LINK_UPDATE_STATUSES.IN_PROGRESS
      || rerunLinkUpdateResult.status === RERUN_LINK_UPDATE_STATUSES.RETRYING
      || rerunLinkUpdateResult.status === RERUN_LINK_UPDATE_STATUSES.SCANNING
      || rerunLinkUpdateResult.status === RERUN_LINK_UPDATE_STATUSES.UPDATING
    ) {
      return;
    }

    const results = rerunLinkUpdateResult.results;
    const responseId = `${rerunLinkUpdateResult.status}-${
      results.map(r => `${r.id}-${r.originalUrl}-${r.newUrl}`).sort().join(',')
    }`;
    if (processedResponseIds.has(responseId)) {
      return;
    }
    setProcessedResponseIds(prev => new Set([...prev, responseId]));
    processUpdateResults({ ...rerunLinkUpdateResult, results }, true);
    setIsUpdateAllInProgress(false);
    setUpdateAllTrigger(t => t + 1);

    if (
      rerunLinkUpdateResult.status === RERUN_LINK_UPDATE_STATUSES.SUCCEEDED
      && results.every(result => result.success)
    ) {
      setErrorMessage(null);
      onErrorStateChange?.(null);
    } else {
      const error = intl.formatMessage(messages.updateLinksError);
      setErrorMessage(error);
      onErrorStateChange?.(error);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [
    intl,
    isUpdateAllInProgress,
    onErrorStateChange,
    processUpdateResults,
    processedResponseIds,
    rerunLinkUpdateResult,
    rerunLinkUpdateStatusQuery.isFetching,
    updateAllPreviousRunLinksMutation.isPending,
  ]);

  const getContentType = useCallback((sectionId: string): string => {
    if (sectionId === 'course-updates') { return 'course_updates'; }
    if (sectionId === 'custom-pages') { return 'custom_pages'; }
    return 'course_content';
  }, []);

  // Get update all button state
  const getUpdateAllButtonState = () => {
    if (rerunLinkUpdateInProgress || isUpdateAllInProgress) {
      return STATEFUL_BUTTON_STATES.pending;
    }
    return STATEFUL_BUTTON_STATES.default;
  };

  // Disable the button if all links have been successfully updated or if polling is in progress
  const areAllLinksUpdated = useMemo(() => {
    if (!hasPreviousRunLinks) { return false; }
    if (rerunLinkUpdateInProgress || isUpdateAllInProgress) { return true; }

    const checkBlockUpdated = (block) => {
      const noPreviousLinks = !block.previousRunLinks?.length;
      const allUpdated = block.previousRunLinks?.every(({ isUpdated }) => isUpdated) ?? true;
      return noPreviousLinks || allUpdated;
    };

    const checkUnitUpdated = (unit) => unit.blocks.every(checkBlockUpdated);
    const checkSubsectionUpdated = (subsection) => subsection.units.every(checkUnitUpdated);
    const checkSectionUpdated = (section) => section.subsections.every(checkSubsectionUpdated);

    const allLinksUpdatedInAPI = allSections.every(checkSectionUpdated);

    if (allLinksUpdatedInAPI) { return true; }

    const allPreviousRunLinks: { linkId: string; isUpdatedInAPI: boolean; }[] = [];
    allSections.forEach(section => {
      section.subsections.forEach(subsection => {
        subsection.units.forEach(unit => {
          unit.blocks.forEach(block => {
            if (block.previousRunLinks) {
              block.previousRunLinks.forEach(({ originalLink, isUpdated }) => {
                const linkId = `${block.id}:${originalLink}`;
                allPreviousRunLinks.push({
                  linkId,
                  isUpdatedInAPI: isUpdated || false,
                });
              });
            }
          });
        });
      });
    });

    if (allPreviousRunLinks.length === 0) { return false; }

    const allUpdated = allPreviousRunLinks.every(({ linkId, isUpdatedInAPI }) =>
      isUpdatedInAPI
      || updatedLinkIds.includes(linkId)
    );

    return allUpdated;
  }, [
    allSections,
    hasPreviousRunLinks,
    updatedLinkIds,
    updateAllTrigger,
    rerunLinkUpdateInProgress,
    isUpdateAllInProgress,
  ]);

  // Handler for updating a single previous run link
  const handleUpdateLink = useCallback(async (link: string, blockId: string, sectionId?: string): Promise<boolean> => {
    const uniqueId = `${blockId}:${link}`;

    try {
      setUpdatingLinkIds(prev => ({ ...prev, [uniqueId]: true }));
      const contentType = getContentType(sectionId || '');
      await updateSinglePreviousRunLinkMutation.mutateAsync({
        linkUrl: link,
        blockId,
        contentType,
      });

      const pollForSingleLinkResult = async (attempts = 0): Promise<boolean> => {
        if (attempts > 30) { // Max 30 attempts (60 seconds)
          throw new Error('Timeout waiting for link update result');
        }

        const { data: updateStatusResponse } = await rerunLinkUpdateStatusQuery.refetch();
        const pollStatus = updateStatusResponse?.status;

        if (
          !updateStatusResponse
          || (pollStatus != null && RERUN_LINK_UPDATE_IN_PROGRESS_STATUSES.includes(pollStatus))
        ) {
          await new Promise(resolve => {
            setTimeout(resolve, 2000);
          });
          return pollForSingleLinkResult(attempts + 1);
        }

        if (updateStatusResponse && updateStatusResponse.results.length > 0) {
          const hasOriginalUrlField = updateStatusResponse.results.some(r => r.originalUrl != null);

          let exactMatch;
          if (hasOriginalUrlField) {
            exactMatch = updateStatusResponse.results.find(
              result => result.id === blockId && result.originalUrl === link && result.success,
            );
          } else {
            exactMatch = updateStatusResponse.results.find(
              result => result.id === blockId && result.success,
            );
          }

          if (exactMatch) {
            const newUrl = exactMatch.newUrl;

            if (newUrl) {
              setUpdatedLinkMap(prev => {
                const newMap = { ...prev, [uniqueId]: newUrl };
                return newMap;
              });

              setUpdatedLinkIds(prev => {
                const filtered = prev.filter(id => id !== uniqueId);
                const newIds = [...filtered, uniqueId];
                return newIds;
              });

              setUpdatingLinkIds(prev => {
                const copy = { ...prev };
                delete copy[uniqueId];
                return copy;
              });

              setErrorMessage(null);
              onErrorStateChange?.(null);

              return true;
            }
          }

          const failed = updateStatusResponse.results.find(result => {
            if (hasOriginalUrlField) {
              return result.id === blockId && result.originalUrl === link && !result.success;
            }
            return result.id === blockId && !result.success;
          });

          if (failed) {
            reportError(intl.formatMessage(messages.updateLinkError));

            setUpdatingLinkIds(prev => {
              const copy = { ...prev };
              delete copy[uniqueId];
              return copy;
            });

            return false;
          }
        }

        // If status is Succeeded but no results for this specific link, consider it failed
        if (pollStatus === RERUN_LINK_UPDATE_STATUSES.SUCCEEDED) {
          reportError(intl.formatMessage(messages.updateLinkError));

          setUpdatingLinkIds(prev => {
            const copy = { ...prev };
            delete copy[uniqueId];
            return copy;
          });

          return false;
        }

        reportError(intl.formatMessage(messages.updateLinkError));

        setUpdatingLinkIds(prev => {
          const copy = { ...prev };
          delete copy[uniqueId];
          return copy;
        });

        return false;
      };

      return await pollForSingleLinkResult();
    } catch {
      reportError(intl.formatMessage(messages.updateLinkError));

      setUpdatingLinkIds(prev => {
        const copy = { ...prev };
        delete copy[uniqueId];
        return copy;
      });

      return false;
    }
  }, [
    getContentType,
    intl,
    reportError,
    onErrorStateChange,
    rerunLinkUpdateStatusQuery,
    updateSinglePreviousRunLinkMutation,
  ]);

  // When updatedLinkIds changes (links marked updated), clear any updating flags for those ids
  useEffect(() => {
    if (!updatedLinkIds || updatedLinkIds.length === 0) {
      return;
    }
    setUpdatingLinkIds(prev => {
      const copy = { ...prev };

      updatedLinkIds.forEach(id => {
        if (copy[id]) {
          delete copy[id];
        }
      });

      return copy;
    });
  }, [updatedLinkIds]);

  const handleUpdateAllCourseLinks = useCallback(async (): Promise<boolean> => {
    try {
      setProcessedResponseIds(new Set());
      setIsUpdateAllInProgress(true);
      await updateAllPreviousRunLinksMutation.mutateAsync();
      return true;
    } catch {
      setIsUpdateAllInProgress(false);
      reportError(intl.formatMessage(messages.updateLinksError));
      return false;
    }
  }, [intl, reportError, updateAllPreviousRunLinksMutation]);

  if (!data || isDataEmpty(data)) {
    return (
      <>
        {errorMessage && (
          <AlertMessage
            variant="danger"
            title=""
            description={errorMessage}
            dismissible
            onClose={() => setErrorMessage(null)}
            className="mt-3"
          />
        )}
        <div className="scan-results">
          <div className="scan-header-second-title-container px-3">
            <header className="sub-header-content">
              <h2 className="broken-links-header-title pt-2">{intl.formatMessage(messages.brokenLinksHeader)}</h2>
            </header>
          </div>
          <div className="no-results-found-container">
            <h3 className="no-results-found">{intl.formatMessage(messages.noResultsFound)}</h3>
          </div>
        </div>
        {waffleFlags.enableCourseOptimizerCheckPrevRunLinks && (
          <div className="scan-results">
            <div className="scan-header-second-title-container px-3">
              <header className="sub-header-content">
                <h2 className="broken-links-header-title pt-2">{intl.formatMessage(messages.linkToPrevCourseRun)}</h2>
              </header>
            </div>
            <div className="no-results-found-container">
              <h3 className="no-results-found">{intl.formatMessage(messages.noResultsFound)}</h3>
            </div>
          </div>
        )}
      </>
    );
  }

  const handleToggle = (index: number) => {
    setOpenStates(prev => prev.map((isOpened, i) => (i === index ? !isOpened : isOpened)));
  };
  const handlePrevRunToggle = (index: number) => {
    setPrevRunOpenStates(prev => prev.map((isOpened, i) => (i === index ? !isOpened : isOpened)));
  };
  const filterOptions = [
    { name: intl.formatMessage(messages.brokenLabel), value: 'brokenLinks' },
    { name: intl.formatMessage(messages.manualLabel), value: 'externalForbiddenLinks' },
    { name: intl.formatMessage(messages.lockedLabel), value: 'lockedLinks' },
  ];

  // Only show sections that have at least one unit with a visible link (not just previousRunLinks)
  const shouldSectionRender = (sectionIndex: number): boolean => {
    const section = allSections[sectionIndex];
    const hasVisibleUnit = section.subsections.some(
      (subsection) =>
        subsection.units.some((unit) =>
          unit.blocks.some((block) => {
            const hasBroken = block.brokenLinks?.length > 0;
            const hasLocked = block.lockedLinks?.length > 0;
            const hasExternal = block.externalForbiddenLinks?.length > 0;

            const noFilters = !filters.brokenLinks
              && !filters.lockedLinks
              && !filters.externalForbiddenLinks;

            const showBroken = filters.brokenLinks && hasBroken;
            const showLocked = filters.lockedLinks && hasLocked;
            const showExternal = filters.externalForbiddenLinks && hasExternal;

            return (
              showBroken
              || showLocked
              || showExternal
              || (noFilters && (hasBroken || hasLocked || hasExternal))
            );
          })
        ),
    );
    return hasVisibleUnit;
  };

  const findPreviousVisibleSection = (currentIndex: number): number => {
    let prevIndex = currentIndex - 1;
    while (prevIndex >= 0) {
      if (shouldSectionRender(prevIndex)) {
        return prevIndex;
      }
      prevIndex--;
    }
    return -1;
  };

  const findNextVisibleSection = (currentIndex: number): number => {
    let nextIndex = currentIndex + 1;
    while (nextIndex < allSections.length) {
      if (shouldSectionRender(nextIndex)) {
        return nextIndex;
      }
      nextIndex++;
    }
    return -1;
  };

  return (
    <>
      {errorMessage && (
        <AlertMessage
          variant="danger"
          title=""
          description={errorMessage}
          dismissible
          onClose={() => setErrorMessage(null)}
          className="mt-3"
        />
      )}
      <div className="scan-results">
        <div className="scan-header-second-title-container px-3">
          <header className="sub-header-content">
            <h2 className="broken-links-header-title pt-2">{intl.formatMessage(messages.brokenLinksHeader)}</h2>
            <Button
              ref={setButtonRef}
              variant="link"
              onClick={open}
              disabled={false}
              iconAfter={ArrowDropDown}
              className="border-0 bg-transparent"
              style={{ color: '#454545' }}
            >
              {intl.formatMessage(messages.filterButtonLabel)}
            </Button>
          </header>
        </div>
        <FilterModal
          isOpen={isOpen}
          // ignoring below line because filter modal doesn't have close button
          // istanbul ignore next
          onClose={close}
          onApply={setFilters}
          positionRef={buttonRef}
          filterOptions={filterOptions}
          initialFilters={filters}
          activeFilters={activeFilters}
          filterBy={filterBy}
          add={add}
          remove={remove}
          set={set}
        />
        {activeFilters.length > 0 && <div className="border-bottom border-light-400" />}
        {activeFilters.length > 0 && (
          <div className="scan-results-active-filters-container">
            <span className="scan-results-active-filters-chips">
              {activeFilters.map(filter => (
                <Chip
                  key={filter}
                  data-testid={`chip-${filter}`}
                  iconAfter={CloseSmall}
                  iconAfterAlt="icon-after"
                  className="scan-results-active-filters-chip"
                  onClick={() => {
                    remove(filter);
                    const updatedFilters = { ...filters, [filter]: false };
                    setFilters(updatedFilters);
                  }}
                >
                  {(() => {
                    const foundOption = filterOptions.find(option => option.value === filter);
                    return foundOption ? foundOption.name : filter;
                  })()}
                </Chip>
              ))}
            </span>
            <Button
              variant="link"
              className="clear-all-btn"
              onClick={() => {
                clear();
                setFilters(initialFilters);
              }}
            >
              {intl.formatMessage(messages.clearFilters)}
            </Button>
          </div>
        )}

        {(() => {
          // Find all visible sections
          const visibleSections = allSections && allSections.length > 0
            ? allSections
              .map((_, index) => (shouldSectionRender(index) ? index : -1))
              .filter(idx => idx !== -1)
            : [];
          if (visibleSections.length === 0) {
            return (
              <div className="no-results-found-container">
                <h3 className="no-results-found">{intl.formatMessage(messages.noResultsFound)}</h3>
              </div>
            );
          }
          return allSections.map((section, index) => {
            if (!shouldSectionRender(index)) {
              return null;
            }
            return (
              <SectionCollapsible
                index={index}
                handleToggle={handleToggle}
                isOpen={openStates[index]}
                hasPrevAndIsOpen={index > 0 ?
                  (() => {
                    const prevVisibleIndex = findPreviousVisibleSection(index);
                    return prevVisibleIndex >= 0 && openStates[prevVisibleIndex];
                  })() :
                  true}
                hasNextAndIsOpen={index < allSections.length - 1 ?
                  (() => {
                    const nextVisibleIndex = findNextVisibleSection(index);
                    return nextVisibleIndex >= 1 && openStates[nextVisibleIndex];
                  })() :
                  true}
                key={section.id}
                title={section.displayName}
                brokenNumber={brokenLinksCounts[index]}
                manualNumber={externalForbiddenLinksCounts[index]}
                lockedNumber={lockedLinksCounts[index]}
                className="section-collapsible-header"
              >
                {section.subsections.map((subsection) => (
                  <>
                    {subsection.units.map((unit) => {
                      // Determine if any block in this unit should be shown based on filters
                      const hasVisibleBlock = unit.blocks.some((block) => {
                        const hasBroken = block.brokenLinks?.length > 0;
                        const hasLocked = block.lockedLinks?.length > 0;
                        const hasExternal = block.externalForbiddenLinks?.length > 0;

                        const showBroken = filters.brokenLinks && hasBroken;
                        const showLocked = filters.lockedLinks && hasLocked;
                        const showExternal = filters.externalForbiddenLinks && hasExternal;

                        const noFilters = !filters.brokenLinks
                          && !filters.lockedLinks
                          && !filters.externalForbiddenLinks;

                        return showBroken
                          || showLocked
                          || showExternal
                          || (noFilters && (hasBroken || hasLocked || hasExternal));
                      });

                      if (hasVisibleBlock) {
                        return (
                          <div className="unit" key={unit.id}>
                            <BrokenLinkTable unit={unit} filters={filters} updatedLinks={[]} />
                          </div>
                        );
                      }
                      return null;
                    })}
                  </>
                ))}
              </SectionCollapsible>
            );
          });
        })()}
      </div>

      {waffleFlags.enableCourseOptimizerCheckPrevRunLinks
        && allSections
        && allSections.length > 0
        && hasPreviousRunLinks && (() => {
          // Filter out sections/subsections/units that have no previous run links
          const filteredSections = allSections.map((section) => {
            // Filter subsections
            const filteredSubsections = section.subsections.map(subsection => {
              // Filter units
              const filteredUnits = subsection.units.filter(unit =>
                unit.blocks.some(block => {
                  const hasPreviousLinks = block.previousRunLinks?.length > 0;
                  return hasPreviousLinks;
                })
              );
              return {
                ...subsection,
                units: filteredUnits,
              };
            }).filter(subsection => subsection.units.length > 0);
            return {
              ...section,
              subsections: filteredSubsections,
            };
          }).filter(section => section.subsections.length > 0);

          if (filteredSections.length === 0) {
            return null;
          }

          return (
            <div className="scan-results">
              <div className="scan-header-second-title-container px-3">
                <header className="sub-header-content d-flex justify-content-between align-items-center">
                  <h2 className="broken-links-header-title pt-2">{intl.formatMessage(messages.linkToPrevCourseRun)}</h2>
                  <StatefulButton
                    className="px-4 rounded-0 update-all-course-btn"
                    labels={{
                      default: intl.formatMessage(messages.updateAllButtonText),
                      disable: intl.formatMessage(messages.updateAllButtonText),
                      pending: intl.formatMessage(messages.updateAllButtonText),
                    }}
                    icons={{
                      default: '',
                      disable: '',
                      pending: <Icon src={SpinnerSimple} className="icon-spin" />,
                    }}
                    state={Object.keys(updatingLinkIds).length > 0
                      ? STATEFUL_BUTTON_STATES.disable
                      : getUpdateAllButtonState()}
                    onClick={handleUpdateAllCourseLinks}
                    disabled={areAllLinksUpdated}
                    disabledStates={['disable', 'pending']}
                    variant="primary"
                    data-testid="update-all-course"
                  />
                </header>
              </div>
              {filteredSections.map((section, index) => (
                <SectionCollapsible
                  index={index}
                  handleToggle={handlePrevRunToggle}
                  isOpen={prevRunOpenStates[index]}
                  hasPrevAndIsOpen={index > 0 ? prevRunOpenStates[index - 1] : true}
                  hasNextAndIsOpen={index < filteredSections.length - 1 ? prevRunOpenStates[index + 1] : true}
                  key={section.id}
                  title={section.displayName}
                  previousRunLinksCount={previousRunLinksCounts[section.id] || 0}
                  isPreviousRunLinks
                  className="section-collapsible-header"
                >
                  {section.subsections.map((subsection) => (
                    <>
                      {subsection.units.map((unit) => (
                        <div className="unit" key={unit.id}>
                          <BrokenLinkTable
                            unit={unit}
                            linkType="previous"
                            onUpdateLink={handleUpdateLink}
                            sectionId={section.id}
                            updatedLinks={updatedLinkIds}
                            updatedLinkMap={updatedLinkMap}
                            updatedLinkInProgress={updatingLinkIds}
                          />
                        </div>
                      ))}
                    </>
                  ))}
                </SectionCollapsible>
              ))}
            </div>
          );
        })()}

      {waffleFlags.enableCourseOptimizerCheckPrevRunLinks && !hasPreviousRunLinks && (
        <div className="scan-results">
          <div className="scan-header-second-title-container px-3">
            <header className="sub-header-content">
              <h2 className="broken-links-header-title pt-2">{intl.formatMessage(messages.linkToPrevCourseRun)}</h2>
            </header>
          </div>
          <div className="no-results-found-container">
            <h3 className="no-results-found">{intl.formatMessage(messages.noResultsFound)}</h3>
          </div>
        </div>
      )}
    </>
  );
};

export default ScanResults;
