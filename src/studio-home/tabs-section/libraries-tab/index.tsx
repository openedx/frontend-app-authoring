import { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Form, Icon, Menu, MenuItem, Pagination, Row, SearchField,
} from '@openedx/paragon';
import { Error, FilterList } from '@openedx/paragon/icons';

import { LoadingSpinner } from '@src/generic/Loading';
import AlertMessage from '@src/generic/alert-message';
import { useLibrariesV1Data } from '@src/studio-home/data/apiHooks';
import CardItem from '@src/studio-home/card-item';
import SearchFilterWidget from '@src/search-manager/SearchFilterWidget';
import type { LibraryV1Data } from '@src/studio-home/data/api';

import messages from '../messages';
import { MigrateLegacyLibrariesAlert } from './MigrateLegacyLibrariesAlert';

const CardList = ({
  data,
  inSelectMode,
  selectedIds,
}: {
  data: LibraryV1Data[],
  inSelectMode: boolean,
  selectedIds?: string[];
}) => (
  // eslint-disable-next-line react/jsx-no-useless-fragment
  <>
    {
      data?.map(({
        displayName,
        org,
        number,
        url,
        isMigrated,
        migratedToKey,
        migratedToTitle,
        migratedToCollectionKey,
        libraryKey,
      }) => (
        <CardItem
          key={`${org}+${number}`}
          isLibraries
          displayName={displayName}
          org={org}
          number={number}
          url={url}
          itemId={libraryKey}
          selectMode={inSelectMode ? 'multiple' : undefined}
          isSelected={selectedIds?.includes(libraryKey)}
          isMigrated={isMigrated}
          migratedToKey={migratedToKey}
          migratedToTitle={migratedToTitle}
          migratedToCollectionKey={migratedToCollectionKey}
        />
      ))
    }
  </>
);

function findInValues<T extends {}>(arr: T[] | undefined, searchValue: string) {
  return arr?.filter(o => Object.values(o).some(value => String(value).toLowerCase().includes(
    String(searchValue).toLowerCase().trim(),
  )));
}

export enum Filter {
  migrated = 'migrated',
  unmigrated = 'unmigrated',
}

export const BaseFilterState = Object.values(Filter);

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

interface LibrariesListProps {
  selectedIds?: string[];
  handleCheck?: (library: LibraryV1Data, action: 'add' | 'remove') => void;
  setSelectedLibraries?: (libraries: LibraryV1Data[]) => void;
  hideMigationAlert?: boolean;
  // We lift `migrationFilter` and `setMigrationFilter` into props
  // so that the filter state is maintained consistently across different
  // steps of the legacy libraries migration flow, and to allow
  // parent components to control and persist the filter context.
  migrationFilter: Filter[];
  setMigrationFilter: React.Dispatch<React.SetStateAction<Filter[]>>;
}

export const LibrariesList = ({
  selectedIds,
  handleCheck,
  setSelectedLibraries,
  hideMigationAlert = false,
  migrationFilter,
  setMigrationFilter,
}: LibrariesListProps) => {
  const intl = useIntl();
  const { isPending, data, isError } = useLibrariesV1Data();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');

  let filteredData = findInValues(data?.libraries, search || '') || [];
  if (migrationFilter.length === 1) {
    // filter results by migrated status
    filteredData = filteredData.filter((obj) => obj.isMigrated === (migrationFilter[0] === Filter.migrated));
  }
  const perPage = 10;
  const totalPages = Math.ceil(filteredData.length / perPage);
  const currentPageData = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);
  const inSelectMode = handleCheck !== undefined;

  const allChecked = filteredData.every(value => selectedIds?.includes(value.libraryKey));
  const someChecked = filteredData.some(value => selectedIds?.includes(value.libraryKey));
  const checkboxIsIndeterminate = someChecked && !allChecked;

  const handleChangeCheckboxSet = useCallback((event) => {
    if (handleCheck) {
      const libraryId = event.target.value;
      const library = currentPageData.find((item) => item.libraryKey === libraryId);
      if (library) {
        if (event.target.checked) {
          handleCheck(library, 'add');
        } else {
          handleCheck(library, 'remove');
        }
      }
    }
  }, [handleCheck, currentPageData]);

  const handleSelectAll = useCallback(() => {
    if (checkboxIsIndeterminate || selectedIds?.length === 0) {
      setSelectedLibraries?.(filteredData);
    } else {
      setSelectedLibraries?.([]);
    }
  }, [checkboxIsIndeterminate, selectedIds, filteredData]);

  if (isPending) {
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
      {!hideMigationAlert && (<MigrateLegacyLibrariesAlert />)}
      <div className="courses-tab">
        <ActionRow className="my-3">
          {inSelectMode && (
            <Form.Checkbox
              checked={allChecked}
              isIndeterminate={checkboxIsIndeterminate}
              onChange={handleSelectAll}
              className="ml-0.5 mr-3"
            >
              <FormattedMessage {...messages.selectAll} />
            </Form.Checkbox>
          )}
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
          {!isPending && !isError
            && (
              <>
                {intl.formatMessage(messages.coursesPaginationInfo, {
                  length: currentPageData?.length,
                  total: data?.libraries.length,
                })}
              </>
            )}
        </ActionRow>
        {inSelectMode ? (
          <Form.CheckboxSet
            name="libraries-list-checkboxset"
            onChange={handleChangeCheckboxSet}
            value={selectedIds}
          >
            <CardList
              data={currentPageData}
              inSelectMode={inSelectMode}
              selectedIds={selectedIds}
            />
          </Form.CheckboxSet>
        ) : (
          <CardList
            data={currentPageData}
            inSelectMode={inSelectMode}
          />
        )}
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
