import React, { useContext, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Breadcrumb,
  Container,
  Layout,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { Link, useParams, useNavigate } from 'react-router-dom';

import ConnectionErrorAlert from '../../generic/ConnectionErrorAlert';
import Loading from '../../generic/Loading';
import getPageHeadTitle from '../../generic/utils';
import SubHeader from '../../generic/sub-header/SubHeader';
import taxonomyMessages from '../messages';
import TaxonomyDetailMenu from './TaxonomyDetailMenu';
import TaxonomyDetailSideCard from './TaxonomyDetailSideCard';
import { TagListTable } from '../tag-list';
import ExportModal from '../export-modal';
import { useTaxonomyDetailDataResponse, useTaxonomyDetailDataStatus } from './data/apiHooks';
import DeleteDialog from '../delete-dialog';
import { useDeleteTaxonomy } from '../data/apiHooks';
import { TaxonomyContext } from '../common/context';
import SystemDefinedBadge from '../system-defined-badge';

const TaxonomyDetailPage = () => {
  const intl = useIntl();
  const { taxonomyId: taxonomyIdString } = useParams();
  const { setToastMessage } = useContext(TaxonomyContext);
  const taxonomyId = Number(taxonomyIdString);

  const taxonomy = useTaxonomyDetailDataResponse(taxonomyId);
  const { isError, isFetched } = useTaxonomyDetailDataStatus(taxonomyId);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteTaxonomy = useDeleteTaxonomy();
  const navigate = useNavigate();

  const onClickDeleteTaxonomy = React.useCallback(() => {
    deleteTaxonomy({ pk: taxonomy.id }, {
      onSuccess: async () => {
        setToastMessage(intl.formatMessage(taxonomyMessages.taxonomyDeleteToast, { name: taxonomy.name }));
        navigate('/taxonomies');
      },
      onError: async () => {
        // TODO: display the error to the user
      },
    });
  }, [setToastMessage, taxonomy]);

  const menuItems = ['export', 'delete'];
  const systemDefinedMenuItems = ['export'];
  const menuItemActions = {
    export: () => setIsExportModalOpen(true),
    delete: () => setIsDeleteDialogOpen(true),
  };

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

  const renderModals = () => isExportModalOpen && (
    <ExportModal
      isOpen={isExportModalOpen}
      onClose={() => setIsExportModalOpen(false)}
      taxonomyId={taxonomy.id}
    />
  );

  const renderDeleteDialog = () => isDeleteDialogOpen && (
    <DeleteDialog
      isOpen={isDeleteDialogOpen}
      onClose={() => setIsDeleteDialogOpen(false)}
      onDelete={onClickDeleteTaxonomy}
      taxonomyName={taxonomy.name}
      tagsCount={0}
    />
  );

  const onClickMenuItem = (menuName) => (
    menuItemActions[menuName]?.()
  );

  const getHeaderActions = () => {
    let enabledMenuItems = menuItems;
    if (taxonomy.systemDefined) {
      enabledMenuItems = systemDefinedMenuItems;
    }
    return (
      <TaxonomyDetailMenu
        id={taxonomy.id}
        name={taxonomy.name}
        onClickMenuItem={onClickMenuItem}
        menuItems={enabledMenuItems}
      />
    );
  };

  const getSystemDefinedBadge = () => {
    if (taxonomy.systemDefined) {
      return <SystemDefinedBadge taxonomyId={taxonomyId} />;
    }
    return null;
  };

  return (
    <>
      <Helmet>
        <title>{getPageHeadTitle(intl.formatMessage(taxonomyMessages.headerTitle), taxonomy.name)}</title>
      </Helmet>
      <div className="pt-4.5 pr-4.5 pl-4.5 pb-2 bg-light-100 box-shadow-down-2">
        <Container size="xl">
          <Breadcrumb
            links={[
              { label: intl.formatMessage(taxonomyMessages.headerTitle), to: '/taxonomies/' },
            ]}
            activeLabel={taxonomy.name}
            linkAs={Link}
          />
          <SubHeader
            title={taxonomy.name}
            titleActions={getSystemDefinedBadge()}
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
      {renderDeleteDialog()}
    </>
  );
};

export default TaxonomyDetailPage;
