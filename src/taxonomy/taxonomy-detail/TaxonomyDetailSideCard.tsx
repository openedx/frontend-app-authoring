import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Card,
} from '@openedx/paragon';
import { TaxonomyData } from '../data/types';

import messages from './messages';

interface TaxonomyDetailSideCardProps {
  taxonomy: Pick<TaxonomyData, 'name' | 'exportId' | 'description'>;
}

const TaxonomyDetailSideCard: React.FC<TaxonomyDetailSideCardProps> = ({ taxonomy }) => {
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

export default TaxonomyDetailSideCard;
