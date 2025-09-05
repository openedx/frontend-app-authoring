import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Form, Icon, Menu, MenuItem, Pagination, Row, SearchField,
} from '@openedx/paragon';
import { Error, FilterList } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';

import { LoadingSpinner } from '@src/generic/Loading';
import AlertMessage from '@src/generic/alert-message';
import { useLibrariesV1Data } from '@src/studio-home/data/apiHooks';
import CardItem from '@src/studio-home/card-item';
import { useCallback, useState } from 'react';
import SearchFilterWidget from '@src/search-manager/SearchFilterWidget';
import messages from '../messages';
import { MigrateLegacyLibrariesAlert } from './MigrateLegacyLibrariesAlert';

function findInValues<T extends {}>(arr: T[] | undefined, searchValue: string) {
  return arr?.filter(o => Object.values(o).some(value => String(value).toLowerCase().includes(
    String(searchValue).toLowerCase().trim(),
  )));
}

enum Filter {
  migrated = 'migrated',
  unmigrated = 'unmigrated',
}

const BaseFilterState = Object.values(Filter);

interface MigrationFilterProps {
  filters: Filter[];
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
}

const MigrationFilter = ({ filters, setFilters }: MigrationFilterProps) => {
  const intl = useIntl();
  const filterLabels = {
    [Filter.migrated]: intl.formatMessage(messages.librariesV1TabMigrationFilterMigratedLabel),
    [Filter.unmigrated]: intl.formatMessage(messages.librariesV1TabMigrationFilterUnmigratedLabel),
  };

  let label = intl.formatMessage(messages.librariesV1TabMigrationFilterLabel);
  // Set appliedFilters to empty list to indicate clear state
  let appliedFilters: { label: string }[] = [];
  if (filters.length === 1) {
    // Update label to display selected filter item, i.e., Migrated or Unmigrated
    label = filterLabels[filters[0]];
    // Only update appliedFilters if a single option is selected else show clear state.
    appliedFilters = filters.map(filter => ({ label: filterLabels[filter] }));
  }

  const toggleFilter = useCallback((filter: Filter) => {
    setFilters((oldList: Filter[]) => {
      if (oldList.includes(filter)) {
        const newList = oldList.filter(m => m !== filter);
        if (newList.length === 0) {
          return BaseFilterState;
        }
        return newList;
      }
      // istanbul ignore next
      return [...oldList, filter];
    });
  }, [setFilters]);

  const menuItems = useCallback(() => BaseFilterState.map((item) => (
    <MenuItem
      key={item}
      as={Form.Checkbox}
      value={item}
      onChange={() => { toggleFilter(item); }}
    >
      {filterLabels[item]}
    </MenuItem>
  )), [toggleFilter, BaseFilterState]);

  return (
    <SearchFilterWidget
      appliedFilters={appliedFilters}
      label={label}
      clearFilter={() => setFilters(BaseFilterState)} // On clear select both migrated and unmigrated options.
      icon={FilterList}
      skipLabelUpdate
    >
      <Form.Group className="mb-0">
        <Form.CheckboxSet
          name="publish-status-filter"
          value={filters}
        >
          <Menu className="block-type-refinement-menu" style={{ boxShadow: 'none' }}>
            {menuItems()}
          </Menu>
        </Form.CheckboxSet>
      </Form.Group>
    </SearchFilterWidget>
  );
};

const LibrariesTab = () => {
  const intl = useIntl();
  const { isLoading, data, isError } = useLibrariesV1Data();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [migrationFilter, setMigrationFilter] = useState<Filter[]>(BaseFilterState);

  let filteredData = findInValues(data?.libraries, search || '') || [];
  if (migrationFilter.length === 1) {
    // filter results by migrated status
    filteredData = filteredData.filter((obj) => obj.isMigrated === (migrationFilter[0] === Filter.migrated));
  }
  const perPage = 10;
  const totalPages = Math.ceil(filteredData.length / perPage);
  const currentPageData = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);

  if (isLoading) {
    return (
      <Row className="m-0 mt-4 justify-content-center">
        <LoadingSpinner />
      </Row>
    );
  }

  if (isError) {
    return (
      <AlertMessage
        variant="danger"
        description={(
          <Row className="m-0 align-items-center">
            <Icon src={Error} className="text-danger-500 mr-1" />
            <span>{intl.formatMessage(messages.librariesTabErrorMessage)}</span>
          </Row>
        )}
      />
    );
  }

  return (
    <>
      <MigrateLegacyLibrariesAlert />
      <div className="courses-tab">
        <ActionRow className="my-3">
          <SearchField
            // istanbul ignore next
            onSubmit={() => {}}
            onChange={setSearch}
            value={search}
            className="mr-4"
            placeholder={intl.formatMessage(messages.librariesV2TabLibrarySearchPlaceholder)}
          />
          <MigrationFilter filters={migrationFilter} setFilters={setMigrationFilter} />
          <ActionRow.Spacer />
          {!isLoading && !isError
            && (
              <>
                {intl.formatMessage(messages.coursesPaginationInfo, {
                  length: currentPageData?.length,
                  total: data.libraries.length,
                })}
              </>
            )}
        </ActionRow>
        {currentPageData?.map(({
          displayName, org, number, url, isMigrated, migratedToKey, migratedToTitle, migratedToCollectionKey,
        }) => (
          <CardItem
            key={`${org}+${number}`}
            isLibraries
            displayName={displayName}
            org={org}
            number={number}
            url={url}
            isMigrated={isMigrated}
            migratedToKey={migratedToKey}
            migratedToTitle={migratedToTitle}
            migratedToCollectionKey={migratedToCollectionKey}
          />
        ))}
        {
          totalPages > 1
            && (
              <Pagination
                className="d-flex justify-content-center"
                paginationLabel="pagination navigation"
                pageCount={totalPages}
                currentPage={currentPage}
                onPageSelect={setCurrentPage}
              />
            )
        }
      </div>
    </>
  );
};

export default LibrariesTab;
