import { useState, useMemo, FC } from 'react';
import {
  Card,
  Chip,
  Button,
  useCheckboxSetValues,
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
  const intl = useIntl();
  const [isModalOpen, setModalOpen] = useState(false);
  const initialFilters = {
    brokenLinks: false,
    lockedLinks: false,
    externalForbiddenLinks: false,
  };
  const [filters, setFilters] = useState(initialFilters);
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

  if (!data?.sections) {
    return <InfoCard text={intl.formatMessage(messages.noBrokenLinksCard)} />;
  }

  const { sections } = data;
  const filterOptions = [
    { name: intl.formatMessage(messages.brokenLabel), value: 'brokenLinks' },
    { name: intl.formatMessage(messages.manualLabel), value: 'externalForbiddenLinks' },
    { name: intl.formatMessage(messages.lockedLabel), value: 'lockedLinks' },
  ];

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
            onClick={() => setModalOpen(true)}
            disabled={false}
            iconAfter={ArrowDropDown}
            className="rounded-sm justify-content-between cadence-button"
          >
            {intl.formatMessage(messages.filterButtonLabel)}
          </Button>
        </header>
      </div>
      <FilterModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
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

      {sections?.map((section, index) => (
        <SectionCollapsible
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
      ))}
    </div>
  );
};

export default ScanResults;
