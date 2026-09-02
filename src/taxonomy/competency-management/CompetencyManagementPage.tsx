import { useIntl } from '@edx/frontend-platform/i18n';
import { Breadcrumb, Container } from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';

import ConnectionErrorAlert from '@src/generic/ConnectionErrorAlert';
import Loading from '@src/generic/Loading';
import SubHeader from '@src/generic/sub-header/SubHeader';
import getPageHeadTitle from '@src/generic/utils';
import taxonomyMessages from '../messages';
import { useTaxonomyDetails } from '../data/apiHooks';

/**
 * Page where competencies of a taxonomy are managed and applied to course content.
 *
 * The page is a placeholder for now: it carries the breadcrumb and the title, the same
 * way the taxonomy detail page does. The competency tree and its actions are added by a
 * later ticket.
 */
export const CompetencyManagementPage = () => {
  const intl = useIntl();
  const { taxonomyId: taxonomyIdString } = useParams();
  const taxonomyId = Number(taxonomyIdString);

  const {
    data: taxonomy,
    isError,
    isFetched,
  } = useTaxonomyDetails(taxonomyId);

  if (!isFetched) {
    return <Loading />;
  }

  if (isError || !taxonomy) {
    return <ConnectionErrorAlert />;
  }

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
            hideBorder
          />
        </Container>
      </div>
    </>
  );
};
