import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Breadcrumb,
  Container,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';

import ConnectionErrorAlert from '@src/generic/ConnectionErrorAlert';
import Loading from '@src/generic/Loading';
import getPageHeadTitle from '@src/generic/utils';
import SubHeader from '@src/generic/sub-header/SubHeader';
import taxonomyMessages from '@src/taxonomy/messages';
import { useTaxonomyDetails } from '@src/taxonomy/data/apiHooks';
import CompetencyTree from './CompetencyTree';
import messages from './messages';

const CompetencyManagementPage = () => {
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
        <title>{getPageHeadTitle(intl.formatMessage(messages.headerTitle), taxonomy.name)}</title>
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
      <div className="bg-light-400 m-4">
        <Container size="xl">
          <CompetencyTree taxonomyId={taxonomyId} taxonomyName={taxonomy.name} />
        </Container>
      </div>
    </>
  );
};

export default CompetencyManagementPage;
