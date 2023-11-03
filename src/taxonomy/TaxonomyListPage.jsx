import React from 'react';
import {
  CardView,
  Container,
  DataTable,
  Spinner,
} from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { StudioFooter } from '@edx/frontend-component-footer';
import Header from '../header';
import SubHeader from '../generic/sub-header/SubHeader';
import messages from './messages';
import TaxonomyCard from './TaxonomyCard';
import { useTaxonomyListDataResponse, useIsTaxonomyListDataLoaded } from './api/hooks/selectors';

const TaxonomyListPage = ({ intl }) => {
  const useTaxonomyListData = () => {
    const taxonomyListData = useTaxonomyListDataResponse();
    const isLoaded = useIsTaxonomyListDataLoaded();
    return { taxonomyListData, isLoaded };
  };

  const { taxonomyListData, isLoaded } = useTaxonomyListData();

  const getHeaderButtons = () => (
    // Download template and import buttons.
    // TODO Add functionality to this buttons.
    undefined
  );

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
            headerActions={getHeaderButtons()}
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

TaxonomyListPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(TaxonomyListPage);
