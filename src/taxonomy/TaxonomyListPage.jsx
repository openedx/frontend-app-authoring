import React from 'react';
import {
  Button,
  CardView,
  Container,
  DataTable,
  FormControl,
  Spinner,
} from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import Header from '../header';
import SubHeader from '../generic/sub-header/SubHeader';
import messages from './messages';
import TaxonomyCard from './TaxonomyCard';
import { useTaxonomyListDataResponse, useIsTaxonomyListDataLoaded } from './api/hooks/selectors.ts';

const TaxonomyListPage = ({ intl }) => {
  const orgDefaultValue = intl.formatMessage(messages.orgInputSelectDefaultValue);

  const useTaxonomyListData = () => {
    const taxonomyListData = useTaxonomyListDataResponse();
    const isLoaded = useIsTaxonomyListDataLoaded();
    return { taxonomyListData, isLoaded };
  };

  const { taxonomyListData, isLoaded } = useTaxonomyListData();

  const getHeaderButtons = () => [
    (
      <Button
        variant="link"
        className="text-dark-900"
      >
        {intl.formatMessage(messages.downloadTemplateButtonLabel)}
      </Button>
    ),
    (
      <Button
        iconBefore={Add}
      >
        {intl.formatMessage(messages.importButtonLabel)}
      </Button>
    ),
  ];

  const getOrgSelect = () => (
    <FormControl as="select" defaultValue={orgDefaultValue} controlClassName="border-0">
      <option>{orgDefaultValue}</option>
    </FormControl>
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
                  Header: 'Name',
                  accessor: 'name',
                },
                {
                  Header: 'Description',
                  accessor: 'description',
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
    </>
  );
};

TaxonomyListPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(TaxonomyListPage);
