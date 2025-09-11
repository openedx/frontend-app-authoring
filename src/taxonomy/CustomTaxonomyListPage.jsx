/* eslint-disable react/prop-types */
import { Helmet } from 'react-helmet';
import {
  CardView, Container, DataTable, Spinner,
} from '@openedx/paragon';
import getPageHeadTitle from '../generic/utils';
import messages from './messages';
import TaxonomyCard from './taxonomy-card';

const CustomTaxonomyListPage = ({
  intl,
  taxonomyListHeaderButtons,
  getOrgSelect,
  taxonomyListData,
  isLoaded,
}) => (
  <Container className="custom-taxonomy-list-page-container">
    <Helmet>
      <title>{getPageHeadTitle('', intl.formatMessage(messages.headerTitle))}</title>
    </Helmet>
    <div className="custom-taxonomy-list-page-header">
      <div className="my-courses-title">{intl.formatMessage(messages.headerTitle)}</div>
      <div className="custom-taxonomy-list-page-header-actions">
        {getOrgSelect()}
        {taxonomyListHeaderButtons}
      </div>
    </div>
    <div className="custom-taxonomy-list-page-content">
      <div className="custom-taxonomy-list-page-content-container">
        {isLoaded && taxonomyListData && (
          <DataTable
            disableElevation
            className="custom-taxonomy-list-page-card-view-table"
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
                Header: '',
                accessor: 'tagsCount',
              },
            ]}
          >
            <CardView
              className="custom-taxonomy-list-page-card-view"
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
      </div>
    </div>
  </Container>
);

export default CustomTaxonomyListPage;
