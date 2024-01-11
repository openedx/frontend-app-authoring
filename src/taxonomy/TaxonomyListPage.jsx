import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  CardView,
  Container,
  DataTable,
  Dropdown,
  OverlayTrigger,
  Spinner,
  Tooltip,
  SelectMenu,
  MenuItem,
} from '@edx/paragon';
import {
  Add,
  Check,
} from '@edx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import { Helmet } from 'react-helmet';

import { useOrganizationListData } from '../generic/data/apiHooks';
import SubHeader from '../generic/sub-header/SubHeader';
import getPageHeadTitle from '../generic/utils';
import { getTaxonomyTemplateApiUrl } from './data/api';
import { useTaxonomyListDataResponse, useIsTaxonomyListDataLoaded } from './data/apiHooks';
import { importTaxonomy } from './import-tags';
import messages from './messages';
import TaxonomyCard from './taxonomy-card';

const ALL_TAXONOMIES = 'All taxonomies';
const UNASSIGNED = 'Unassigned';

const TaxonomyListHeaderButtons = ({ canAdd }) => {
  const intl = useIntl();
  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={(
          <Tooltip>
            {intl.formatMessage(messages.downloadTemplateButtonHint)}
          </Tooltip>
        )}
      >
        <Dropdown>
          <Dropdown.Toggle
            variant="outline-primary"
            data-testid="taxonomy-download-template"
          >
            {intl.formatMessage(messages.downloadTemplateButtonLabel)}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              href={getTaxonomyTemplateApiUrl('csv')}
              data-testid="taxonomy-download-template-csv"
            >
              {intl.formatMessage(messages.downloadTemplateButtonCSVLabel)}
            </Dropdown.Item>
            <Dropdown.Item
              href={getTaxonomyTemplateApiUrl('json')}
              data-testid="taxonomy-download-template-json"
            >
              {intl.formatMessage(messages.downloadTemplateButtonJSONLabel)}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </OverlayTrigger>
      <Button
        iconBefore={Add}
        onClick={() => importTaxonomy(intl)}
        data-testid="taxonomy-import-button"
        disabled={!canAdd}
      >
        {intl.formatMessage(messages.importButtonLabel)}
      </Button>
    </>
  );
};

const OrganizationFilterSelector = ({
  isOrganizationListLoaded,
  organizationListData,
  selectedOrgFilter,
  setSelectedOrgFilter,
}) => {
  const intl = useIntl();
  const isOrgSelected = (value) => (value === selectedOrgFilter ? <Check /> : null);
  const selectOptions = [
    <MenuItem
      key="all-orgs-taxonomies"
      className="x-small"
      iconAfter={() => isOrgSelected(ALL_TAXONOMIES)}
      onClick={() => setSelectedOrgFilter(ALL_TAXONOMIES)}
    >
      { isOrgSelected(ALL_TAXONOMIES)
        ? intl.formatMessage(messages.orgInputSelectDefaultValue)
        : intl.formatMessage(messages.orgAllValue)}
    </MenuItem>,
    <MenuItem
      key="unassigned-taxonomies"
      className="x-small"
      iconAfter={() => isOrgSelected(UNASSIGNED)}
      onClick={() => setSelectedOrgFilter(UNASSIGNED)}
    >
      { intl.formatMessage(messages.orgUnassignedValue) }
    </MenuItem>,
  ];

  if (isOrganizationListLoaded && organizationListData) {
    organizationListData.forEach(org => (
      selectOptions.push(
        <MenuItem
          key={`${org}-taxonomies`}
          className="x-small"
          iconAfter={() => isOrgSelected(org)}
          onClick={() => setSelectedOrgFilter(org)}
        >
          {org}
        </MenuItem>,
      )
    ));
  }

  return (
    <SelectMenu
      className="flex-d x-small taxonomy-orgs-filter-selector"
      variant="tertiary"
      defaultMessage={intl.formatMessage(messages.orgInputSelectDefaultValue)}
      data-testid="taxonomy-orgs-filter-selector"
    >
      { isOrganizationListLoaded
        ? selectOptions
        : (
          <Spinner
            animation="border"
            size="xl"
            screenReaderText={intl.formatMessage(messages.usageLoadingMessage)}
          />
        )}
    </SelectMenu>
  );
};

const TaxonomyListPage = () => {
  const intl = useIntl();
  const [selectedOrgFilter, setSelectedOrgFilter] = useState(ALL_TAXONOMIES);

  const {
    data: organizationListData,
    isSuccess: isOrganizationListLoaded,
  } = useOrganizationListData();

  const useTaxonomyListData = () => {
    const taxonomyListData = useTaxonomyListDataResponse(selectedOrgFilter);
    const isLoaded = useIsTaxonomyListDataLoaded(selectedOrgFilter);
    return { taxonomyListData, isLoaded };
  };
  const { taxonomyListData, isLoaded } = useTaxonomyListData();
  const canAdd = isLoaded ? taxonomyListData.canAdd : false;

  const getOrgSelect = () => (
    // Initialize organization select component
    <OrganizationFilterSelector
      isOrganizationListLoaded={isOrganizationListLoaded}
      organizationListData={organizationListData}
      selectedOrgFilter={selectedOrgFilter}
      setSelectedOrgFilter={setSelectedOrgFilter}
    />
  );

  return (
    <>
      <Helmet>
        <title>{getPageHeadTitle('', intl.formatMessage(messages.headerTitle))}</title>
      </Helmet>
      <div className="pt-4.5 pr-4.5 pl-4.5 pb-2 bg-light-100 box-shadow-down-2">
        <Container size="xl">
          <SubHeader
            title={intl.formatMessage(messages.headerTitle)}
            titleActions={getOrgSelect()}
            headerActions={<TaxonomyListHeaderButtons canAdd={canAdd} />}
            hideBorder
          />
        </Container>
      </div>
      <div className="bg-light-400 mt-1">
        <Container size="xl">
          {isLoaded && (
            <DataTable
              disableElevation
              data={taxonomyListData.results}
              itemCount={taxonomyListData.results.length}
              columns={[
                {
                  Header: 'id',
                  accessor: 'id',
                },
                {
                  Header: 'name',
                  accessor: 'name',
                },
                {
                  Header: 'description',
                  accessor: 'description',
                },
                {
                  Header: 'systemDefined',
                  accessor: 'systemDefined',
                },
                {
                  accessor: 'tagsCount',
                },
              ]}
            >
              <CardView
                className="bg-light-400 p-5"
                CardComponent={(row) => TaxonomyCard(row)}
              />
            </DataTable>
          )}
          {!isLoaded && (
            <Container className="d-flex justify-content-center mt-6">
              <Spinner
                animation="border"
                size="xl"
                screenReaderText={intl.formatMessage(messages.usageLoadingMessage)}
              />
            </Container>
          )}
        </Container>
      </div>
    </>
  );
};

TaxonomyListHeaderButtons.propTypes = {
  canAdd: PropTypes.bool.isRequired,
};

OrganizationFilterSelector.propTypes = {
  isOrganizationListLoaded: PropTypes.bool.isRequired,
  organizationListData: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedOrgFilter: PropTypes.string.isRequired,
  setSelectedOrgFilter: PropTypes.func.isRequired,
};

TaxonomyListPage.propTypes = {};

export default TaxonomyListPage;
