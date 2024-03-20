// @ts-check
import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Breadcrumb,
  Container,
  Layout,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';

import ConnectionErrorAlert from '../../generic/ConnectionErrorAlert';
import Loading from '../../generic/Loading';
import getPageHeadTitle from '../../generic/utils';
import SubHeader from '../../generic/sub-header/SubHeader';
import taxonomyMessages from '../messages';
import { TagListTable } from '../tag-list';
import { TaxonomyMenu } from '../taxonomy-menu';
import TaxonomyDetailSideCard from './TaxonomyDetailSideCard';
import { useTaxonomyDetails } from '../data/apiHooks';
import SystemDefinedBadge from '../system-defined-badge';

const TaxonomyDetailPage = () => {
  const intl = useIntl();
  const { taxonomyId: taxonomyIdString } = useParams();
  const taxonomyId = Number(taxonomyIdString);

  const {
    data: taxonomy,
    isError,
    isFetched,
  } = useTaxonomyDetails(taxonomyId);

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

  const getHeaderActions = () => (
    <TaxonomyMenu
      taxonomy={taxonomy}
    />
  );

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
    </>
  );
};

export default TaxonomyDetailPage;
