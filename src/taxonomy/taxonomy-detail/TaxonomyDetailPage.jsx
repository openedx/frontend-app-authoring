// ts-check
import React, { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Breadcrumb,
  Container,
  Layout,
} from '@edx/paragon';
import { Link, useParams } from 'react-router-dom';

import ConnectionErrorAlert from '../../generic/ConnectionErrorAlert';
import Loading from '../../generic/Loading';
import SubHeader from '../../generic/sub-header/SubHeader';
import taxonomyMessages from '../messages';
import TaxonomyDetailMenu from './TaxonomyDetailMenu';
import TaxonomyDetailSideCard from './TaxonomyDetailSideCard';
import { TagListTable } from '../tag-list';
import ExportModal from '../export-modal';
import { useTaxonomyDetailDataResponse, useTaxonomyDetailDataStatus } from './data/selectors';

const TaxonomyDetailPage = () => {
  const intl = useIntl();
  const { taxonomyId } = useParams();

  const useTaxonomyDetailData = () => {
    const { isError, isFetched } = useTaxonomyDetailDataStatus(taxonomyId);
    const taxonomy = useTaxonomyDetailDataResponse(taxonomyId);
    return { isError, isFetched, taxonomy };
  };

  const { isError, isFetched, taxonomy } = useTaxonomyDetailData(taxonomyId);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  if (!isFetched) {
    return (
      <Loading />
    );
  }

  if (isError || !taxonomy) {
    return (
      <ConnectionErrorAlert />
    );
  }

  const renderModals = () => (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {isExportModalOpen && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          taxonomyId={taxonomy.id}
          taxonomyName={taxonomy.name}
        />
      )}
    </>
  );

  const onClickMenuItem = (menuName) => {
    switch (menuName) {
    case 'export':
      setIsExportModalOpen(true);
      break;
    default:
      break;
    }
  };

  const getHeaderActions = () => (
    <TaxonomyDetailMenu
      id={taxonomy.id}
      name={taxonomy.name}
      disabled={
        // We don't show the export menu, because the system-taxonomies
        // can't be exported. The API returns and error.
        // The entire menu has been disabled because currently only
        // the export menu exists.
        // ToDo: When adding more menus, change this logic to hide only the export menu.
        taxonomy.systemDefined
      }
      onClickMenuItem={onClickMenuItem}
    />
  );

  return (
    <>
      <div className="pt-4.5 pr-4.5 pl-4.5 pb-2 bg-light-100 box-shadow-down-2">
        <Container size="xl">
          <Breadcrumb
            links={[
              { label: intl.formatMessage(taxonomyMessages.headerTitle), to: '/taxonomy-list/' },
            ]}
            activeLabel={taxonomy.name}
            linkAs={Link}
          />
          <SubHeader
            title={taxonomy.name}
            hideBorder
            headerActions={getHeaderActions()}
          />
        </Container>
      </div>
      <div className="bg-light-400 m-4">
        <Container size="xl">
          <Layout
            lg={[{ span: 9 }, { span: 3 }]}
            md={[{ span: 9 }, { span: 3 }]}
            sm={[{ span: 9 }, { span: 3 }]}
            xs={[{ span: 9 }, { span: 3 }]}
            xl={[{ span: 9 }, { span: 3 }]}
          >
            <Layout.Element>
              <TagListTable taxonomyId={taxonomyId} />
            </Layout.Element>
            <Layout.Element>
              <TaxonomyDetailSideCard taxonomy={taxonomy} />
            </Layout.Element>
          </Layout>
        </Container>
      </div>
      {renderModals()}
    </>
  );
};

export default TaxonomyDetailPage;
