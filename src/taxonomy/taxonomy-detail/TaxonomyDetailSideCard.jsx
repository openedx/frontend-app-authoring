import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Card,
} from '@openedx/paragon';
import PropTypes from 'prop-types';

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
      <Card.Section title={intl.formatMessage(messages.taxonomyDetailsExportID)}>
        {taxonomy.exportId}
      </Card.Section>
    </Card>
  );
};

TaxonomyDetailSideCard.propTypes = {
  taxonomy: PropTypes.shape({
    name: PropTypes.string.isRequired,
    exportId: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
};

export default TaxonomyDetailSideCard;
