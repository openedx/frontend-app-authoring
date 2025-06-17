/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
import { Helmet } from 'react-helmet';
import { Container, Layout } from '@openedx/paragon';
import { useNavigate } from 'react-router-dom';
import { LmsBook } from '@openedx/paragon/icons';
import { TagListTable } from '../tag-list';
import TaxonomyDetailSideCard from './TaxonomyDetailSideCard';
import taxonomyMessages from '../messages';

const CustomTaxonomyDetailPage = ({
  intl,
  taxonomy,
  getPageHeadTitle,
  getSystemDefinedBadge,
  getHeaderActions,
  taxonomyId,
}) => {
  const navigate = useNavigate();
  return (
    <div className="custom-taxonomy-detail-page-container">
      <Helmet>
        <title>{getPageHeadTitle(intl.formatMessage(taxonomyMessages.headerTitle), taxonomy.name)}</title>
      </Helmet>
      <div className="custom-taxonomy-detail-page-header">
        <div className="ca-breadcrumb-bg">
          <div className="ca-breadcrumb-container">
            <div className="ca-breadcrumb d-flex align-items-center">
              <span className="ca-breadcrumb-icon collection-breadcrumb-icon" onClick={() => navigate('/taxonomies')}>
                <LmsBook className="custom-icon" />
                {intl.formatMessage(taxonomyMessages.headerTitle)}
              </span>
              <span className="ca-breadcrumb-divider">/</span>
              <span className="ca-breadcrumb-current">{taxonomy.name || 'Loading...'}</span>
            </div>
            <div className="ca-title library-breadcrumb-title">
              <div>
                {taxonomy.name || 'Loading...'}
                {getSystemDefinedBadge()}
              </div>
              <div className="custom-taxonomy-detail-page-header-title-actions">
                {getHeaderActions()}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="custom-taxonomy-detail-page-content">
        <Container>
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
            <Layout.Element className="custom-taxonomy-detail-page-side-card">
              <TaxonomyDetailSideCard taxonomy={taxonomy} />
            </Layout.Element>
          </Layout>
        </Container>
      </div>
    </div>
  );
};

export default CustomTaxonomyDetailPage;
