import React, { useContext } from 'react';
import {
  Button,
  CardView,
  Container,
  DataTable,
  Spinner,
} from '@edx/paragon';
import {
  Add,
} from '@edx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Helmet } from 'react-helmet';
import SubHeader from '../generic/sub-header/SubHeader';
import getPageHeadTitle from '../generic/utils';
import { importTaxonomy } from './import-tags';
import messages from './messages';
import TaxonomyCard from './taxonomy-card';
import { useTaxonomyListDataResponse, useIsTaxonomyListDataLoaded, useDeleteTaxonomy } from './data/apiHooks';
import { TaxonomyContext } from './common/context';

const TaxonomyListHeaderButtons = () => {
  const intl = useIntl();
  return (
    <>
      <Button variant="outline-primary" disabled>
        {intl.formatMessage(messages.downloadTemplateButtonLabel)}
      </Button>
      <Button
        iconBefore={Add}
        onClick={() => importTaxonomy(intl)}
        data-testid="taxonomy-import-button"
      >
        {intl.formatMessage(messages.importButtonLabel)}
      </Button>
    </>
  );
};

const TaxonomyListPage = () => {
  const intl = useIntl();
  const deleteTaxonomy = useDeleteTaxonomy();
  const { setToastMessage } = useContext(TaxonomyContext);

  const onDeleteTaxonomy = React.useCallback((id, name) => {
    deleteTaxonomy({ pk: id }, {
      onSuccess: async () => {
        setToastMessage(intl.formatMessage(messages.taxonomyDeleteToast, { name }));
      },
      onError: async () => {
        // TODO: display the error to the user
      },
    });
  }, [setToastMessage]);

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
      <Helmet>
        <title>{getPageHeadTitle('', intl.formatMessage(messages.headerTitle))}</title>
      </Helmet>
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
                {
                  accessor: 'tagsCount',
                },
              ]}
            >
              <CardView
                className="bg-light-400 p-5"
                CardComponent={(row) => TaxonomyCard({ ...row, onDeleteTaxonomy })}
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

TaxonomyListPage.propTypes = {};

export default TaxonomyListPage;
