import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Collapsible } from '@openedx/paragon';
import { Link } from 'react-router-dom';

import AlertError from '../../generic/alert-error';
import Loading from '../../generic/Loading';
import { useFetchIndexDocuments, type ContentHit } from '../../search-manager';
import { useComponentDownstreamLinks } from '../data/apiHooks';
import messages from './messages';

interface ComponentUsageProps {
  usageKey: string;
}

type ComponentUsageTree = Record<string, {
  key: string,
  contextName: string,
  links: ContentHit['breadcrumbs'][1][],
}>;

export const ComponentUsage = ({ usageKey }: ComponentUsageProps) => {
  const {
    data: dataDownstreamLinks,
    isError: isErrorDownstreamLinks,
    error: errorDownstreamLinks,
    isLoading: isLoadingDownstreamLinks,
  } = useComponentDownstreamLinks(usageKey);

  const downstreamKeys = dataDownstreamLinks || [];

  const {
    data: downstreamHits,
    isError: isErrorIndexDocuments,
    error: errorIndexDocuments,
    isLoading: isLoadingIndexDocuments,
  } = useFetchIndexDocuments({
    filter: [`usage_key IN ["${downstreamKeys.join('","')}"]`],
    limit: downstreamKeys.length,
    attributesToRetrieve: ['usage_key', 'breadcrumbs', 'context_key'],
    enabled: !!downstreamKeys.length,
  });

  if (isErrorDownstreamLinks || isErrorIndexDocuments) {
    return <AlertError error={errorDownstreamLinks || errorIndexDocuments} />;
  }

  if (isLoadingDownstreamLinks || isLoadingIndexDocuments) {
    return <Loading />;
  }

  if (!downstreamKeys.length) {
    return <FormattedMessage {...messages.detailsTabUsageEmpty} />;
  }

  const componentUsage = downstreamHits.reduce<ComponentUsageTree>((acc, hit) => {
    const link = hit.breadcrumbs.at(-1);
    // istanbul ignore if: this should never happen. it is a type guard for the breadcrumb last item
    if (!(link && ('usageKey' in link))) {
      return acc;
    }

    if (hit.contextKey in acc) {
      acc[hit.contextKey].links.push(link);
    } else {
      acc[hit.contextKey] = {
        key: hit.contextKey,
        contextName: hit.breadcrumbs[0].displayName,
        links: [link],
      };
    }
    return acc;
  }, {});

  const componentUsageList = Object.values(componentUsage);

  return (
    <>
      {
        componentUsageList.map((context) => (
          <Collapsible key={context.key} title={context.contextName} styling="basic">
            {context.links.map(({ usageKey: downstreamUsageKey, displayName }) => (
              <Link
                key={downstreamUsageKey}
                to={`/course/${context.key}/container/${downstreamUsageKey}`}
              >
                {displayName}
              </Link>
            ))}
          </Collapsible>
        ))
      }
    </>
  );
};
