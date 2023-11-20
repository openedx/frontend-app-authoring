import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Card,
} from '@edx/paragon';
import Proptypes from 'prop-types';

import messages from './messages';

const TaxonomyDetailSideCard = ({ taxonomy }) => {
  const intl = useIntl();
  return (
    <Card>
      <Card.Header title={intl.formatMessage(messages.taxonomyDetailsHeader)} />
      <Card.Section title={intl.formatMessage(messages.taxonomyDetailsName)}>
        {taxonomy.name}
      </Card.Section>
      <Card.Divider className="ml-3 mr-3" />
      <Card.Section title={intl.formatMessage(messages.taxonomyDetailsDescription)}>
        {taxonomy.description}
      </Card.Section>
    </Card>
  );
};

TaxonomyDetailSideCard.propTypes = {
  taxonomy: Proptypes.shape({
    name: Proptypes.string.isRequired,
    description: Proptypes.string.isRequired,
  }).isRequired,
};

export default TaxonomyDetailSideCard;
