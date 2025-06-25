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
import BrokenLinkTable from './BrokenLinkTable';
import { LinkCheckResult } from '../types';
import { countBrokenLinks } from '../utils';
import FilterModal from './filterModal';

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
  const [isOpen, open, close] = useToggle(false);
  const initialFilters = {
    brokenLinks: false,
    lockedLinks: false,
    externalForbiddenLinks: false,
  };
  const [filters, setFilters] = useState(initialFilters);
  const [openStates, setOpenStates] = useState<boolean[]>([]);
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  const {
    brokenLinksCounts,
    lockedLinksCounts,
    externalForbiddenLinksCounts,
  } = useMemo(() => countBrokenLinks(data), [data?.sections]);

  const activeFilters = Object.keys(filters).filter(key => filters[key]);
  const [filterBy, {
    add, remove, set, clear,
  }] = useCheckboxSetValues(activeFilters);

  useEffect(() => {
    setOpenStates(data?.sections ? data.sections.map(() => false) : []);
  }, [data?.sections]);
  if (!data?.sections) {
    return <InfoCard text={intl.formatMessage(messages.noBrokenLinksCard)} />;
  }

  const { sections } = data;
  const handleToggle = (index: number) => {
    setOpenStates(prev => prev.map((isOpened, i) => (i === index ? !isOpened : isOpened)));
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
    while (nextIndex < sections.length) {
      if (shouldSectionRender(nextIndex)) {
        return nextIndex;
      }
      nextIndex++;
    }
    return -1;
  };

  return (
    <div className="scan-results">
      <div className="scan-header-title-container">
        <h2 className="scan-header-title">{intl.formatMessage(messages.scanHeader)}</h2>
      </div>
      <div className="scan-header-second-title-container">
        <header className="sub-header-content">
          <h2 className="broken-links-header-title pt-2">{intl.formatMessage(messages.brokenLinksHeader)}</h2>
          <Button
            ref={setButtonRef}
            variant="outline-primary"
            onClick={open}
            disabled={false}
            iconAfter={ArrowDropDown}
            className="justify-content-between"
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

      {sections?.map((section, index) => {
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
            hasNextAndIsOpen={index < sections.length - 1 ? (() => {
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
      })}
      {hasSectionsRendered === false && (
        <div className="no-results-found-container">
          <h3 className="no-results-found">{intl.formatMessage(messages.noResultsFound)}</h3>
        </div>
      )}
    </div>
  );
};

export default ScanResults;
