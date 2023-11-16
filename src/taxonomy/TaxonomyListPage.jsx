import React from 'react';
import {
  Button,
  CardView,
  Container,
  DataTable,
  Dropdown,
  OverlayTrigger,
  Spinner,
  Tooltip,
} from '@edx/paragon';
import {
  Add,
} from '@edx/paragon/icons';

import { StudioFooter } from '@edx/frontend-component-footer';
import { useIntl } from '@edx/frontend-platform/i18n';
import Header from '../header';
import SubHeader from '../generic/sub-header/SubHeader';
import messages from './messages';
import TaxonomyCard from './taxonomy-card';
import { getTaxonomyTemplateFile } from './data/api';
import { useTaxonomyListDataResponse, useIsTaxonomyListDataLoaded } from './data/apiHooks';

const TaxonomyListHeaderButtons = () => {
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
              onClick={() => getTaxonomyTemplateFile('csv')}
              data-testid="taxonomy-download-template-csv"
            >
              {intl.formatMessage(messages.downloadTemplateButtonCSVLabel)}
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => getTaxonomyTemplateFile('json')}
              data-testid="taxonomy-download-template-json"
            >
              {intl.formatMessage(messages.downloadTemplateButtonJSONLabel)}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </OverlayTrigger>
      <Button iconBefore={Add} disabled>
        {intl.formatMessage(messages.importButtonLabel)}
      </Button>
    </>
  );
};

const TaxonomyListPage = () => {
  const intl = useIntl();
  const useTaxonomyListData = () => {
    const taxonomyListData = useTaxonomyListDataResponse();
    const isLoaded = useIsTaxonomyListDataLoaded();
    return { taxonomyListData, isLoaded };
  };

  const { taxonomyListData, isLoaded } = useTaxonomyListData();

  const getOrgSelect = () => (
    // Organization select component
    // TODO Add functionality to this component
    undefined
  );

  return (
    <>
      <style>
        {`
          body {
              background-color: #E9E6E4; /* light-400 */
          }
        `}
      </style>
      <Header isHiddenMainMenu />
      <div className="pt-4.5 pr-4.5 pl-4.5 pb-2 bg-light-100 box-shadow-down-2">
        <Container size="xl">
          <SubHeader
            title={intl.formatMessage(messages.headerTitle)}
            titleActions={getOrgSelect()}
            headerActions={<TaxonomyListHeaderButtons />}
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
              columns={[
                {
                  accessor: 'id',
                },
                {
                  accessor: 'name',
                },
                {
                  accessor: 'description',
                },
                {
                  accessor: 'systemDefined',
                },
              ]}
            >
              <CardView
                className="bg-light-400 p-5"
                CardComponent={TaxonomyCard}
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
      <StudioFooter />
    </>
  );
};

TaxonomyListPage.propTypes = {};

export default TaxonomyListPage;
