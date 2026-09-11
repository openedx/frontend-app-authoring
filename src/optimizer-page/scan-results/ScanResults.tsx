import {
  useEffect,
  useState,
  useMemo,
  useRef,
  FC,
  useCallback,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import type { Filters, LinkCheckResult, Unit } from '../types';
import type { RerunLinkUpdateResult, RerunLinkUpdateStatusData } from '../data/apiHooks';
import {
  areAllPreviousRunLinksUpdated,
  buildSyntheticSections,
  countPreviousRunLinksBySection,
  countBrokenLinks,
  filterSectionsWithPreviousRunLinks,
  hasPreviousRunLinks,
  isDataEmpty,
} from '../utils';
import FilterModal from './filterModal';
import { useWaffleFlags } from '../../data/apiHooks';
import {
  courseOptimizerQueryKeys,
  useRerunLinkUpdateStatus,
  useUpdateAllPreviousRunLinks,
  useUpdateSinglePreviousRunLink,
} from '../data/apiHooks';
import { STATEFUL_BUTTON_STATES } from '../../constants';
import {
  RERUN_LINK_UPDATE_IN_PROGRESS_STATUSES,
  RERUN_LINK_UPDATE_STATUSES,
} from '../data/constants';

const hasVisibleBlock = (block: Unit['blocks'][number], filters: Filters): boolean => {
  const hasBroken = block.brokenLinks?.length > 0;
  const hasLocked = block.lockedLinks?.length > 0;
  const hasExternal = block.externalForbiddenLinks?.length > 0;
  const noFilters = !filters.brokenLinks && !filters.lockedLinks && !filters.externalForbiddenLinks;

  return (filters.brokenLinks && hasBroken)
    || (filters.lockedLinks && hasLocked)
    || (filters.externalForbiddenLinks && hasExternal)
    || (noFilters && (hasBroken || hasLocked || hasExternal));
};

interface Props {
  data: LinkCheckResult | null;
  courseId: string;
}

const ScanResults: FC<Props> = ({ data, courseId }) => {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const waffleFlags = useWaffleFlags(courseId);
  const [isUpdateAllInProgress, setIsUpdateAllInProgress] = useState(false);
  const [isSingleLinkPolling, setIsSingleLinkPolling] = useState(false);
  const activeSinglePollersRef = useRef(0);
  const singlePollerCleanupsRef = useRef(new Set<() => void>());
  const mountedRef = useRef(true);
  const setSinglePolling = useCallback((active: boolean) => {
    activeSinglePollersRef.current = active
      ? activeSinglePollersRef.current + 1
      : Math.max(0, activeSinglePollersRef.current - 1);
    if (mountedRef.current) {
      setIsSingleLinkPolling(activeSinglePollersRef.current > 0);
    }
  }, []);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      singlePollerCleanupsRef.current.forEach(cleanup => cleanup());
      singlePollerCleanupsRef.current.clear();
      activeSinglePollersRef.current = 0;
    };
  }, []);
  const rerunLinkUpdateStatusQuery = useRerunLinkUpdateStatus(courseId, {
    enabled: waffleFlags.enableCourseOptimizerCheckPrevRunLinks,
    manualPolling: isSingleLinkPolling,
  });
  // Server status owns interval refetches; single-link updates own bounded manual GETs.
  const updateAllPreviousRunLinksMutation = useUpdateAllPreviousRunLinks(courseId);
  const updateSinglePreviousRunLinkMutation = useUpdateSinglePreviousRunLink(courseId);
  const { data: rerunLinkUpdateResult, isError, isFetching, refetch } = rerunLinkUpdateStatusQuery;
  const { isPending: isUpdateAllPending, mutateAsync: updateAll } = updateAllPreviousRunLinksMutation;
  const { mutateAsync: updateSingle } = updateSinglePreviousRunLinkMutation;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const reportError = useCallback((message: string) => {
    setErrorMessage(message);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  useEffect(() => {
    if (isError) {
      setIsUpdateAllInProgress(false);
      reportError(intl.formatMessage(messages.updateLinksError));
    }
  }, [intl, reportError, isError]);
  const serverRerunLinkUpdateInProgress = !isError
    && rerunLinkUpdateResult?.status != null
    && RERUN_LINK_UPDATE_IN_PROGRESS_STATUSES.includes(rerunLinkUpdateResult.status);
  const rerunLinkUpdateInProgress = isUpdateAllPending
    || isUpdateAllInProgress
    || serverRerunLinkUpdateInProgress;
  const [isOpen, open, close] = useToggle(false);
  const [updatedLinkIds, setUpdatedLinkIds] = useState<string[]>([]);
  const [updatedLinkMap, setUpdatedLinkMap] = useState<Record<string, string>>({});
  const [updatingLinkIds, setUpdatingLinkIds] = useState<Record<string, boolean>>({});
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

  const renderableSections = useMemo(
    () =>
      buildSyntheticSections(
        data?.courseUpdates,
        data?.customPages,
        {
          courseUpdates: intl.formatMessage(messages.courseUpdatesHeader),
          customPages: intl.formatMessage(messages.customPagesHeader),
        },
      ),
    [data?.courseUpdates, data?.customPages, intl],
  );

  const allSections = useMemo(
    () => [...renderableSections, ...(sections || [])],
    [renderableSections, sections],
  );

  const {
    brokenLinksCounts,
    lockedLinksCounts,
    externalForbiddenLinksCounts,
  } = useMemo(() => countBrokenLinks({ sections: allSections }), [allSections]);

  const hasPreviousRunLinksInSections = useMemo(
    () => hasPreviousRunLinks(allSections),
    [allSections],
  );
  const previousRunLinksCounts = useMemo(
    () => countPreviousRunLinksBySection(allSections),
    [allSections],
  );
  const previousRunSections = useMemo(
    () => filterSectionsWithPreviousRunLinks(allSections),
    [allSections],
  );

  // Keep original section indexes so counts and accordion state stay aligned with allSections.
  const visibleSectionIndexes = useMemo(
    () =>
      allSections.reduce<number[]>((indexes, section, sectionIndex) => {
        const hasVisibleUnit = section.subsections.some(subsection =>
          subsection.units.some(unit => unit.blocks.some(block => hasVisibleBlock(block, filters)))
        );
        if (hasVisibleUnit) {
          indexes.push(sectionIndex);
        }
        return indexes;
      }, []),
    [allSections, filters],
  );

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

      setUpdatedLinkMap(currentMap => ({ ...currentMap, ...newMap }));

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

  // Without a backend operation ID/version, refresh authoritative link-check state on terminal rerun observations.
  useEffect(() => {
    if (
      isFetching
      || !rerunLinkUpdateResult
      || rerunLinkUpdateResult.status == null
      || RERUN_LINK_UPDATE_IN_PROGRESS_STATUSES.includes(rerunLinkUpdateResult.status)
    ) {
      return;
    }

    queryClient.invalidateQueries({ queryKey: courseOptimizerQueryKeys.linkCheckStatus(courseId) });
  }, [
    courseId,
    isFetching,
    queryClient,
    rerunLinkUpdateResult,
  ]);

  // Process terminal results after the optimistic Pending cache entry has been replaced.
  useEffect(() => {
    if (
      !isUpdateAllInProgress
      || isUpdateAllPending
      || isFetching
      || !rerunLinkUpdateResult
      || isError
      || serverRerunLinkUpdateInProgress
    ) {
      return;
    }

    processUpdateResults(rerunLinkUpdateResult, true);
    setIsUpdateAllInProgress(false);

    if (
      rerunLinkUpdateResult.status === RERUN_LINK_UPDATE_STATUSES.SUCCEEDED
      && rerunLinkUpdateResult.results.every(result => result.success)
    ) {
      setErrorMessage(null);
    } else {
      const error = intl.formatMessage(messages.updateLinksError);
      setErrorMessage(error);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [
    intl,
    isError,
    isUpdateAllInProgress,
    processUpdateResults,
    rerunLinkUpdateResult,
    isFetching,
    isUpdateAllPending,
    serverRerunLinkUpdateInProgress,
  ]);

  const getContentType = useCallback((sectionId: string): string => {
    if (sectionId === 'course-updates') { return 'course_updates'; }
    if (sectionId === 'custom-pages') { return 'custom_pages'; }
    return 'course_content';
  }, []);

  // Get update all button state
  const getUpdateAllButtonState = () => {
    if (rerunLinkUpdateInProgress) {
      return STATEFUL_BUTTON_STATES.pending;
    }
    return STATEFUL_BUTTON_STATES.default;
  };

  // Disable the button if all links have been successfully updated or if polling is in progress
  const areAllLinksUpdated = useMemo(() => {
    if (!hasPreviousRunLinksInSections) { return false; }
    if (rerunLinkUpdateInProgress) { return true; }
    return areAllPreviousRunLinksUpdated(allSections, updatedLinkIds);
  }, [
    allSections,
    hasPreviousRunLinksInSections,
    updatedLinkIds,
    rerunLinkUpdateInProgress,
  ]);

  // Handler for updating a single previous run link
  const handleUpdateLink = useCallback(async (link: string, blockId: string, sectionId?: string): Promise<boolean> => {
    const uniqueId = `${blockId}:${link}`;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let resolveTimer: (() => void) | null = null;
    const cancel = () => {
      cancelled = true;
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      resolveTimer?.();
      resolveTimer = null;
    };
    singlePollerCleanupsRef.current.add(cancel);
    setSinglePolling(true);

    try {
      setUpdatingLinkIds(prev => ({ ...prev, [uniqueId]: true }));
      const contentType = getContentType(sectionId || '');
      await updateSingle({
        linkUrl: link,
        blockId,
        contentType,
      });

      const pollForSingleLinkResult = async (attempts = 0): Promise<boolean> => {
        if (cancelled || !mountedRef.current) {
          return false;
        }
        if (attempts >= 30) { // Up to 30 attempts, with two seconds between retries (roughly one minute)
          throw new Error('Timeout waiting for link update result');
        }

        const pollResponse = await refetch();
        if (pollResponse.isError || pollResponse.error) {
          throw pollResponse.error ?? new Error('Failed to fetch link update result');
        }
        if (cancelled || !mountedRef.current) {
          return false;
        }
        const updateStatusResponse = pollResponse.data;
        const pollStatus = updateStatusResponse?.status;

        if (
          !updateStatusResponse
          || (pollStatus != null && RERUN_LINK_UPDATE_IN_PROGRESS_STATUSES.includes(pollStatus))
        ) {
          await new Promise<void>(resolve => {
            resolveTimer = resolve;
            timer = setTimeout(() => {
              timer = null;
              resolveTimer = null;
              resolve();
            }, 2000);
          });
          return pollForSingleLinkResult(attempts + 1);
        }

        if (updateStatusResponse && updateStatusResponse.results.length > 0) {
          const hasOriginalUrlField = updateStatusResponse.results.some(r => r.originalUrl != null);

          let exactMatch: RerunLinkUpdateResult | undefined;
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
              setUpdatedLinkMap(prev => ({ ...prev, [uniqueId]: newUrl }));
              setUpdatedLinkIds(prev => [
                ...prev.filter(id => id !== uniqueId),
                uniqueId,
              ]);
              setUpdatingLinkIds(prev => {
                const copy = { ...prev };
                delete copy[uniqueId];
                return copy;
              });

              setErrorMessage(null);

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
      if (cancelled || !mountedRef.current) {
        return false;
      }
      reportError(intl.formatMessage(messages.updateLinkError));

      setUpdatingLinkIds(prev => {
        const copy = { ...prev };
        delete copy[uniqueId];
        return copy;
      });

      return false;
    } finally {
      singlePollerCleanupsRef.current.delete(cancel);
      setSinglePolling(false);
    }
  }, [
    getContentType,
    intl,
    reportError,
    refetch,
    setSinglePolling,
    updateSingle,
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
      setIsUpdateAllInProgress(true);
      await updateAll();
      return true;
    } catch {
      setIsUpdateAllInProgress(false);
      reportError(intl.formatMessage(messages.updateLinksError));
      return false;
    }
  }, [intl, reportError, updateAll]);

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

        {visibleSectionIndexes.length === 0 ?
          (
            <div className="no-results-found-container">
              <h3 className="no-results-found">{intl.formatMessage(messages.noResultsFound)}</h3>
            </div>
          ) :
          allSections.map((section, index) => {
            if (!visibleSectionIndexes.includes(index)) {
              return null;
            }
            const visiblePosition = visibleSectionIndexes.indexOf(index);
            const previousVisibleIndex = visibleSectionIndexes[visiblePosition - 1] ?? -1;
            const nextVisibleIndex = visibleSectionIndexes[visiblePosition + 1] ?? -1;
            return (
              <SectionCollapsible
                index={index}
                handleToggle={handleToggle}
                isOpen={openStates[index]}
                hasPrevAndIsOpen={index > 0
                  ? previousVisibleIndex >= 0 && openStates[previousVisibleIndex]
                  : true}
                hasNextAndIsOpen={index < allSections.length - 1
                  ? nextVisibleIndex >= 1 && openStates[nextVisibleIndex]
                  : true}
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
                      const hasVisibleUnit = unit.blocks.some(block => hasVisibleBlock(block, filters));
                      if (hasVisibleUnit) {
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
          })}
      </div>

      {waffleFlags.enableCourseOptimizerCheckPrevRunLinks
        && allSections.length > 0
        && hasPreviousRunLinksInSections
        && previousRunSections.length > 0 && (
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
          {previousRunSections.map((section, index) => (
            <SectionCollapsible
              index={index}
              handleToggle={handlePrevRunToggle}
              isOpen={prevRunOpenStates[index]}
              hasPrevAndIsOpen={index > 0 ? prevRunOpenStates[index - 1] : true}
              hasNextAndIsOpen={index < previousRunSections.length - 1 ? prevRunOpenStates[index + 1] : true}
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
      )}

      {waffleFlags.enableCourseOptimizerCheckPrevRunLinks && !hasPreviousRunLinksInSections && (
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
