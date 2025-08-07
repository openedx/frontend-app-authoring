import {
  useEffect,
  useState,
  useMemo,
  FC,
} from 'react';
import {
  Card,
  Chip,
  Button,
  useCheckboxSetValues,
  useToggle,
} from '@openedx/paragon';
import {
  ArrowDropDown,
  CloseSmall,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import SectionCollapsible from './SectionCollapsible';
import PreviousRunSectionCollapsible from './PreviousRunSectionCollapsible';
import BrokenLinkTable from './BrokenLinkTable';
import PreviousRunLinkTable from './PreviousRunLinkTable';
import { LinkCheckResult } from '../types';
import { countBrokenLinks } from '../utils';
import FilterModal from './filterModal';
import { useWaffleFlags } from '../../data/apiHooks';

const InfoCard: FC<{ text: string }> = ({ text }) => (
  <Card className="mt-4">
    <h3
      className="subsection-header"
      style={{ margin: '1rem', textAlign: 'center' }}
    >
      {text}
    </h3>
  </Card>
);

interface Props {
  data: LinkCheckResult | null;
}

const ScanResults: FC<Props> = ({ data }) => {
  let hasSectionsRendered = false;
  const intl = useIntl();
  const waffleFlags = useWaffleFlags();
  const [isOpen, open, close] = useToggle(false);
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

  const virtualSections = useMemo(() => {
    const createVirtualSection = (
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
          units: itemsWithLinks.map(item => ({
            id: item.name,
            displayName: item.name,
            url: item.url,
            blocks: [{
              id: `${item.name}-block`,
              displayName: item.name,
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

    const vSections = [];

    if (data?.courseUpdates?.length > 0) {
      const courseUpdatesSection = createVirtualSection(data.courseUpdates, 'course-updates', 'courseUpdatesHeader');
      if (courseUpdatesSection) {
        vSections.push(courseUpdatesSection);
      }
    }

    if (data?.customPages?.length > 0) {
      const customPagesSection = createVirtualSection(
        data.customPages,
        'custom-pages',
        'customPagesHeader',
      );
      if (customPagesSection) {
        vSections.push(customPagesSection);
      }
    }

    return vSections;
  }, [data?.courseUpdates, data?.customPages, intl]);

  // Combine virtual sections with regular sections
  const allSectionsForBrokenLinks = useMemo(
    () => [...virtualSections, ...(sections || [])],
    [virtualSections, sections],
  );

  const allSectionsForPrevRun = useMemo(
    () => [...virtualSections, ...(sections || [])],
    [virtualSections, sections],
  );

  const {
    brokenLinksCounts,
    lockedLinksCounts,
    externalForbiddenLinksCounts,
  } = useMemo(() => countBrokenLinks({ sections: allSectionsForBrokenLinks }), [allSectionsForBrokenLinks]);

  // Calculate if there are any previous run links across all sections
  const hasPreviousRunLinks = useMemo(
    // eslint-disable-next-line max-len
    () => allSectionsForPrevRun.some(section => section.subsections.some(subsection => subsection.units.some(unit => unit.blocks.some(block => block.previousRunLinks && block.previousRunLinks.length > 0)))),
    [allSectionsForPrevRun],
  );

  // Calculate previous run links count for each section (including virtual sections)
  const previousRunLinksCounts = useMemo(() => {
    if (!allSectionsForPrevRun) { return []; }
    return allSectionsForPrevRun.map(section => section.subsections.reduce(
      (sectionTotal, subsection) => sectionTotal
        + subsection.units.reduce(
          (unitTotal, unit) => unitTotal
          + unit.blocks.reduce(
            (blockTotal, block) => blockTotal + (block.previousRunLinks?.length || 0),
            0,
          ),
          0,
        ),
      0,
    ));
  }, [allSectionsForPrevRun]);

  const activeFilters = Object.keys(filters).filter(key => filters[key]);
  const [filterBy, {
    add, remove, set, clear,
  }] = useCheckboxSetValues(activeFilters);

  useEffect(() => {
    setOpenStates(allSectionsForBrokenLinks ? allSectionsForBrokenLinks.map(() => false) : []);
    setPrevRunOpenStates(allSectionsForPrevRun ? allSectionsForPrevRun.map(() => false) : []);
  }, [allSectionsForBrokenLinks, allSectionsForPrevRun]);

  if (!data) {
    return <InfoCard text={intl.formatMessage(messages.noBrokenLinksCard)} />;
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
  const shouldSectionRender = (sectionIndex: number): boolean => (
    (!filters.brokenLinks && !filters.externalForbiddenLinks && !filters.lockedLinks)
    || (filters.brokenLinks && brokenLinksCounts[sectionIndex] > 0)
    || (filters.externalForbiddenLinks && externalForbiddenLinksCounts[sectionIndex] > 0)
    || (filters.lockedLinks && lockedLinksCounts[sectionIndex] > 0)
  );

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
    while (nextIndex < allSectionsForBrokenLinks.length) {
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
        <div className="scan-header-second-title-container">
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
                {filterOptions.find(option => option.value === filter)?.name}
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

        {allSectionsForBrokenLinks && allSectionsForBrokenLinks.length > 0 ? (
          allSectionsForBrokenLinks.map((section, index) => {
            if (!shouldSectionRender(index)) {
              return null;
            }
            hasSectionsRendered = true;
            return (
              <SectionCollapsible
                index={index}
                handleToggle={handleToggle}
                isOpen={openStates[index]}
                hasPrevAndIsOpen={index > 0 ? (() => {
                  const prevVisibleIndex = findPreviousVisibleSection(index);
                  return prevVisibleIndex >= 0 && openStates[prevVisibleIndex];
                })() : true}
                hasNextAndIsOpen={index < allSectionsForBrokenLinks.length - 1 ? (() => {
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
                      if (
                        (!filters.brokenLinks && !filters.externalForbiddenLinks && !filters.lockedLinks)
                       || (filters.brokenLinks && unit.blocks.some(block => block.brokenLinks.length > 0))
                       || (filters.externalForbiddenLinks
                           && unit.blocks.some(block => block.externalForbiddenLinks.length > 0))
                       || (filters.lockedLinks && unit.blocks.some(block => block.lockedLinks.length > 0))
                      ) {
                        return (
                          <div className="unit">
                            <BrokenLinkTable unit={unit} filters={filters} />
                          </div>
                        );
                      }
                      return null;
                    })}
                  </>
                ))}
              </SectionCollapsible>
            );
          })
        ) : (
          <div className="no-results-found-container">
            <h3 className="no-results-found">{intl.formatMessage(messages.noResultsFound)}</h3>
          </div>
        )}

        {hasSectionsRendered === false && allSectionsForBrokenLinks && allSectionsForBrokenLinks.length > 0 && (
          <div className="no-results-found-container">
            <h3 className="no-results-found">{intl.formatMessage(messages.noResultsFound)}</h3>
          </div>
        )}
      </div>
      {waffleFlags.enableCourseOptimizerCheckPrevRunLinks
        && allSectionsForPrevRun
        && allSectionsForPrevRun.length > 0
        && hasPreviousRunLinks && (
        <div className="scan-results">
          <div className="scan-header-second-title-container">
            <header className="sub-header-content">
              <h2 className="broken-links-header-title pt-2">{intl.formatMessage(messages.linkToPrevCourseRun)}</h2>
            </header>
          </div>
          {allSectionsForPrevRun?.map((section, index) => (
            <PreviousRunSectionCollapsible
              index={index}
              handleToggle={handlePrevRunToggle}
              isOpen={prevRunOpenStates[index]}
              hasPrevAndIsOpen={index > 0 ? prevRunOpenStates[index - 1] : true}
              hasNextAndIsOpen={index < allSectionsForPrevRun.length - 1 ? prevRunOpenStates[index + 1] : true}
              key={section.id}
              title={section.displayName}
              previousRunLinksCount={previousRunLinksCounts[index]}
              className="section-collapsible-header"
            >
              {section.subsections.map((subsection) => (
                <>
                  {subsection.units.map((unit) => {
                    // Only render units that have previous run links
                    if (hasPreviousRunLinks) {
                      return (
                        <div className="unit">
                          <PreviousRunLinkTable unit={unit} />
                        </div>
                      );
                    }
                    return null;
                  })}
                </>
              ))}
            </PreviousRunSectionCollapsible>
          ))}
        </div>
      )}

      {waffleFlags.enableCourseOptimizerCheckPrevRunLinks && !hasPreviousRunLinks && (
      <div className="scan-results">
        <div className="scan-header-second-title-container">
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
