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
import { useDispatch } from 'react-redux';
import messages from './messages';
import SectionCollapsible from './SectionCollapsible';
import BrokenLinkTable from './BrokenLinkTable';
import { LinkCheckResult } from '../types';
import { countBrokenLinks, isDataEmpty } from '../utils';
import FilterModal from './filterModal';
import { useWaffleFlags } from '../../data/apiHooks';
import {
  updateAllPreviousRunLinks, updateSinglePreviousRunLink, fetchRerunLinkUpdateStatus,
} from '../data/thunks';
import { STATEFUL_BUTTON_STATES } from '../../constants';
import { RERUN_LINK_UPDATE_IN_PROGRESS_STATUSES } from '../data/constants';

interface Props {
  data: LinkCheckResult | null;
  courseId: string;
  onErrorStateChange?: (errorMessage: string | null) => void;
  rerunLinkUpdateInProgress?: boolean | null;
  rerunLinkUpdateResult?: any;
}

const ScanResults: FC<Props> = ({
  data, courseId, onErrorStateChange, rerunLinkUpdateInProgress, rerunLinkUpdateResult,
}) => {
  const intl = useIntl();
  const waffleFlags = useWaffleFlags();
  const dispatch = useDispatch();
  const [isOpen, open, close] = useToggle(false);
  const [updatedLinkIds, setUpdatedLinkIds] = useState<string[]>([]);
  const [updatedLinkMap, setUpdatedLinkMap] = useState<Record<string, string>>({});
  const [updatingLinkIds, setUpdatingLinkIds] = useState<Record<string, boolean>>({});
  const [isUpdateAllInProgress, setIsUpdateAllInProgress] = useState(false);
  const [, setUpdateAllCompleted] = useState(false);
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
      items: any[],
      sectionId: string,
      messageKey: keyof typeof messages,
    ) => {
      const itemsWithLinks = items.filter(item => (item.brokenLinks && item.brokenLinks.length > 0)
        || (item.lockedLinks && item.lockedLinks.length > 0)
        || (item.externalForbiddenLinks && item.externalForbiddenLinks.length > 0)
        || (item.previousRunLinks && item.previousRunLinks.length > 0));

      if (itemsWithLinks.length === 0) { return null; }

      return {
        id: sectionId,
        displayName: intl.formatMessage(messages[messageKey]),
        subsections: [{
          id: `${sectionId}-subsection`,
          displayName: `${intl.formatMessage(messages[messageKey])} Subsection`,
          units: itemsWithLinks.map(item => {
            const blockId = item.blockId || item.block_id || item.id;

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

    const rSections: any[] = [];

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
  const allSections = useMemo(
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
    () => allSections.some(section => (
      section.subsections.some(subsection => subsection.units.some(unit => (
        unit.blocks.some(block => block.previousRunLinks && block.previousRunLinks.length > 0)
      ))))),
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
    add, remove, set, clear,
  }] = useCheckboxSetValues(activeFilters);

  useEffect(() => {
    setOpenStates(allSections ? allSections.map(() => false) : []);
    setPrevRunOpenStates(allSections ? allSections.map(() => false) : []);
  }, [allSections]);

  // Reset update all completion state when data changes (new scan results)
  useEffect(() => {
    setUpdateAllCompleted(false);
  }, [data]);

  const processUpdateResults = useCallback((response: any, isBulkUpdate = false) => {
    if (!response) {
      return;
    }

    if (response.status === 'Succeeded' && (isBulkUpdate || (response.results && response.results.length > 4))) {
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
        section.subsections.forEach(sub => sub.units.forEach(unit => unit.blocks.forEach(b => {
          if (b.previousRunLinks?.length) { blocksWithResults.add(b.id); }
        })));
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
            const originalUrl = result.original_url || result.originalUrl;
            const newUrl = result.new_url || result.newUrl;

            if (result.success && newUrl && originalUrl) {
              const matchingLink = blockData.previousRunLinks.find(
                ({ originalLink }) => {
                  const matches = originalLink === originalUrl;
                  return matches;
                },
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

          const colonIndex = existingId.indexOf(':');
          if (colonIndex > 0) {
            const blockId = existingId.substring(0, colonIndex);

            if (!blocksWithResults.has(blockId)) {
              preservedIds.push(existingId);
            } else {
              preservedIds.push(existingId);
            }
          } else {
            preservedIds.push(existingId);
          }
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

          const colonIndex = existingId.indexOf(':');
          if (colonIndex > 0) {
            const blockId = existingId.substring(0, colonIndex);

            if (!blocksWithResults.has(blockId)) {
              preservedMap[existingId] = currentMap[existingId];
            } else {
              preservedMap[existingId] = currentMap[existingId];
            }
          } else {
            preservedMap[existingId] = currentMap[existingId];
          }
        });

        const result = { ...preservedMap, ...newMap };
        return result;
      });

      return;
    }

    if (response.results && Array.isArray(response.results)) {
      const successfulResults = response.results.filter((r: any) => r.success);
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

                  const exactMatch = successfulResults.find(result => {
                    const originalUrl = result.original_url || result.originalUrl;
                    return result.id === block.id && originalUrl === originalLink;
                  });

                  if (exactMatch && (exactMatch.newUrl || exactMatch.new_url)) {
                    successfulLinkIds.push(uid);
                    newMap[uid] = exactMatch.newUrl || exactMatch.new_url;
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

  // Process update results during polling when status is 'Succeeded' or results are present
  useEffect(() => {
    if (
      rerunLinkUpdateResult
      && (rerunLinkUpdateResult.status === 'Succeeded'
       || (rerunLinkUpdateResult.results && rerunLinkUpdateResult.results.length > 0))
    ) {
      const allResultIds = rerunLinkUpdateResult.results?.map(r => r.id).sort().join(',') || '';
      const responseId = `${rerunLinkUpdateResult.status}-${rerunLinkUpdateResult.results?.length}-${allResultIds}-${isUpdateAllInProgress}`;

      if (processedResponseIds.has(responseId)) {
        return;
      }

      setProcessedResponseIds(prev => new Set([...prev, responseId]));
      processUpdateResults(rerunLinkUpdateResult, isUpdateAllInProgress);

      // Handle completion for "Update All" operation (check for success status as indicator)
      if (rerunLinkUpdateResult.status === 'Succeeded' && isUpdateAllInProgress) {
        const failedCount = rerunLinkUpdateResult.results
          ? rerunLinkUpdateResult.results.filter((r: any) => !r.success).length
          : 0;

        setIsUpdateAllInProgress(false);
        setUpdateAllCompleted(failedCount === 0);
        setUpdateAllTrigger(t => t + 1);

        if (failedCount > 0) {
          if (onErrorStateChange) {
            onErrorStateChange(intl.formatMessage(messages.updateLinksError));
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (onErrorStateChange) {
          onErrorStateChange(null);
        }
      }
    }
  }, [rerunLinkUpdateResult,
    rerunLinkUpdateInProgress,
    isUpdateAllInProgress,
    intl,
    onErrorStateChange,
    processUpdateResults,
    processedResponseIds,
  ]);

  // Handle completion of rerun link updates when polling stops
  useEffect(() => {
    const handleUpdateCompletion = async () => {
      if (rerunLinkUpdateInProgress === false && isUpdateAllInProgress) {
        try {
          const updateStatusResponse = await dispatch(fetchRerunLinkUpdateStatus(courseId)) as any;

          if (!updateStatusResponse) {
            setIsUpdateAllInProgress(false);
            setUpdateAllCompleted(false);
            if (onErrorStateChange) {
              onErrorStateChange(intl.formatMessage(messages.updateLinksError));
            }
            return;
          }

          processUpdateResults(updateStatusResponse, true);
          let failedCount = 0;

          if (updateStatusResponse.results) {
            failedCount = updateStatusResponse.results.filter((r: any) => !r.success).length;
          } else if (updateStatusResponse.status === 'Succeeded') {
            failedCount = 0;
          } else {
            failedCount = 1;
          }

          setIsUpdateAllInProgress(false);
          setUpdateAllCompleted(failedCount === 0);
          setUpdateAllTrigger(t => t + 1);

          if (failedCount > 0) {
            if (onErrorStateChange) {
              onErrorStateChange(intl.formatMessage(messages.updateLinksError));
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (onErrorStateChange) {
            onErrorStateChange(null);
          }
        } catch (error) {
          setIsUpdateAllInProgress(false);
          setUpdateAllCompleted(false);
          setUpdateAllTrigger(t => t + 1);
          if (onErrorStateChange) {
            onErrorStateChange(intl.formatMessage(messages.updateLinksError));
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    handleUpdateCompletion();
  }, [rerunLinkUpdateInProgress,
    isUpdateAllInProgress,
    dispatch,
    courseId,
    allSections,
    intl,
    onErrorStateChange,
    processUpdateResults,
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

    const allPreviousRunLinks: { linkId: string; isUpdatedInAPI: boolean }[] = [];
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

    const allUpdated = allPreviousRunLinks.every(({ linkId, isUpdatedInAPI }) => isUpdatedInAPI
      || updatedLinkIds.includes(linkId));

    return allUpdated;
  }, [allSections,
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
      await dispatch(updateSinglePreviousRunLink(courseId, link, blockId, contentType));

      const pollForSingleLinkResult = async (attempts = 0): Promise<boolean> => {
        if (attempts > 30) { // Max 30 attempts (60 seconds)
          throw new Error('Timeout waiting for link update result');
        }

        const updateStatusResponse = await dispatch(fetchRerunLinkUpdateStatus(courseId)) as any;
        const pollStatus = updateStatusResponse?.status || updateStatusResponse?.updateStatus;

        if (!updateStatusResponse || RERUN_LINK_UPDATE_IN_PROGRESS_STATUSES.includes(pollStatus)) {
          await new Promise(resolve => {
            setTimeout(resolve, 2000);
          });
          return pollForSingleLinkResult(attempts + 1);
        }

        if (updateStatusResponse && updateStatusResponse.results && updateStatusResponse.results.length > 0) {
          const hasOriginalUrlField = updateStatusResponse.results.some(r => r.original_url !== undefined);

          let exactMatch;
          if (hasOriginalUrlField) {
            exactMatch = updateStatusResponse.results.find(
              (result: any) => {
                const matches = result.id === blockId
                              && result.original_url === link
                              && result.success === true;

                return matches;
              },
            );
          } else {
            exactMatch = updateStatusResponse.results.find(
              (result: any) => {
                const matches = result.id === blockId && result.success === true;
                return matches;
              },
            );
          }

          if (exactMatch) {
            const newUrl = exactMatch.new_url || exactMatch.newUrl || exactMatch.url;

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

              if (onErrorStateChange) {
                onErrorStateChange(null);
              }

              return true;
            }
          }

          const failed = updateStatusResponse.results.find(
            (result: any) => {
              if (hasOriginalUrlField) {
                return result.id === blockId
                       && result.original_url === link
                       && result.success === false;
              }
              return result.id === blockId && result.success === false;
            },
          );

          if (failed) {
            if (onErrorStateChange) {
              onErrorStateChange(intl.formatMessage(messages.updateLinkError));
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });

            setUpdatingLinkIds(prev => {
              const copy = { ...prev };
              delete copy[uniqueId];
              return copy;
            });

            return false;
          }
        }

        // If status is 'Succeeded' but no results for this specific link, consider it failed
        if (pollStatus === 'Succeeded') {
          if (onErrorStateChange) {
            onErrorStateChange(intl.formatMessage(messages.updateLinkError));
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });

          setUpdatingLinkIds(prev => {
            const copy = { ...prev };
            delete copy[uniqueId];
            return copy;
          });

          return false;
        }

        if (onErrorStateChange) {
          onErrorStateChange(intl.formatMessage(messages.updateLinkError));
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setUpdatingLinkIds(prev => {
          const copy = { ...prev };
          delete copy[uniqueId];
          return copy;
        });

        return false;
      };

      return await pollForSingleLinkResult();
    } catch (error) {
      if (onErrorStateChange) {
        onErrorStateChange(intl.formatMessage(messages.updateLinkError));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setUpdatingLinkIds(prev => {
        const copy = { ...prev };
        delete copy[uniqueId];
        return copy;
      });

      return false;
    }
  }, [dispatch, courseId, getContentType, intl, onErrorStateChange]);

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
      await dispatch(updateAllPreviousRunLinks(courseId));

      return true;
    } catch (error) {
      setIsUpdateAllInProgress(false); // Reset on error
      if (onErrorStateChange) {
        onErrorStateChange(intl.formatMessage(messages.updateLinksError));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
  }, [dispatch, courseId, intl, onErrorStateChange]);

  if (!data || isDataEmpty(data)) {
    return (
      <>
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
      (subsection) => subsection.units.some((unit) => unit.blocks.some((block) => {
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
      })),
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
                  const foundOption = filterOptions.filter(option => option.value === filter)[0];
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
                hasPrevAndIsOpen={index > 0 ? (() => {
                  const prevVisibleIndex = findPreviousVisibleSection(index);
                  return prevVisibleIndex >= 0 && openStates[prevVisibleIndex];
                })() : true}
                hasNextAndIsOpen={index < allSections.length - 1 ? (() => {
                  const nextVisibleIndex = findNextVisibleSection(index);
                  return nextVisibleIndex >= 1 && openStates[nextVisibleIndex];
                })() : true}
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
            const filteredUnits = subsection.units.filter(unit => unit.blocks.some(block => {
              const hasPreviousLinks = block.previousRunLinks?.length > 0;
              return hasPreviousLinks;
            }));
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
                  state={
                      Object.keys(updatingLinkIds).length > 0
                        ? STATEFUL_BUTTON_STATES.disable
                        : getUpdateAllButtonState()
                    }
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
                      <div className="unit">
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
