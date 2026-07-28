import {
  Badge,
  Stack,
} from '@openedx/paragon';
import messages from './messages';

import type { TaxonomyData } from '@src/taxonomy/data/types';
import { SystemDefinedBadge } from './SystemDefinedBadge';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

interface Props {
  taxonomy: TaxonomyData;
  className?: string;
}

/**
 * Taxonomy badges. These badges show details about what type of taxonomy we're
 * looking at. This is shown on the cards on the taxonomy list page and on the
 * individual taxonomy details page.
 */
export const TaxonomyBadges = ({ taxonomy, ...props }: Props) => {
  const orgsCount = taxonomy.orgs.length;

  let orgsBadge: React.ReactNode;
  if (taxonomy.allOrgs) {
    orgsBadge = <FormattedMessage {...messages.orgsAll} />
  } else if (taxonomy.orgs.length === 1) {
    orgsBadge = taxonomy.orgs[0];
  } else {
    orgsBadge = <FormattedMessage {...messages.orgsCount} values={{orgsCount}} />
  }

  return (
    <Stack direction="horizontal" gap={2} className={`font-size-normal font-weight-normal ${props.className}`}>
      {!taxonomy.enabled ?
        (
          // Note: disabled taxonomies aren't listed on the taxonomy list, but you can still access them in the UI if
          // you go to their URL directly, and that's where this "Disabled" badge would show up.
          <Badge variant="light" className="p-1.5 font-weight-normal">
            <FormattedMessage {...messages.disabledBadge} />
          </Badge>
        ) :
        null}

      {taxonomy.systemDefined ? <SystemDefinedBadge taxonomyId={taxonomy.id} /> : null}

      {taxonomy.allowFreeText ? <Badge variant="light" className="p-1.5 font-weight-normal"><FormattedMessage {...messages.freeTextLabel} /></Badge> : null}

      {taxonomy.allowMultiple ? null : <Badge variant="light" className="p-1.5 font-weight-normal"><FormattedMessage {...messages.singleTagLabel} /></Badge>}

      <Badge variant="light" className="p-1.5 font-weight-normal">
        {orgsBadge}
      </Badge>
    </Stack>
  );
};
