import React, { useContext } from 'react';
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
import { useIntl } from '@edx/frontend-platform/i18n';
import { Helmet } from 'react-helmet';
import SubHeader from '../generic/sub-header/SubHeader';
import getPageHeadTitle from '../generic/utils';
import messages from './messages';
import TaxonomyCard from './taxonomy-card';
import { getTaxonomyTemplateApiUrl } from './data/api';
import { useTaxonomyListDataResponse, useIsTaxonomyListDataLoaded, useDeleteTaxonomy } from './data/apiHooks';
import { TaxonomyContext } from './common/context';

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
      <Button iconBefore={Add} disabled>
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
