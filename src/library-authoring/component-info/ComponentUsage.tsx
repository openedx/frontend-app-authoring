import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Collapsible, Hyperlink, Stack } from '@openedx/paragon';

import AlertError from '../../generic/alert-error';
import Loading from '../../generic/Loading';
import { useFetchIndexDocuments } from '../../search-manager';
import { useComponentDownstreamLinks } from '../data/apiHooks';
import messages from './messages';

interface ComponentUsageProps {
  usageKey: string;
  callbackEmpty?: (() => void) | null;
}

type ComponentUsageTree = Record<string, {
  key: string,
  contextName: string,
  links: {
    [usageKey: string]: {
      displayName: string,
      url: string,
    },
  },
}>;

const getContainerUrl = (usageKey: string) => (
  `${getConfig().STUDIO_BASE_URL}/container/${usageKey}`
);

export const ComponentUsage = ({
  usageKey,
  callbackEmpty,
}: ComponentUsageProps) => {
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

  if (isLoadingDownstreamLinks || (isLoadingIndexDocuments && !!downstreamKeys.length)) {
    return <Loading />;
  }

  if (!downstreamKeys.length || !downstreamHits) {
    if (callbackEmpty) {
      callbackEmpty();
    }
    return <FormattedMessage {...messages.detailsTabUsageEmpty} />;
  }

  const componentUsage = downstreamHits.reduce<ComponentUsageTree>((acc, hit) => {
    const link = hit.breadcrumbs.at(-1);
    // istanbul ignore if: this should never happen. it is a type guard for the breadcrumb last item
    if (!(link && ('usageKey' in link))) {
      return acc;
    }

    const linkData = {
      displayName: link.displayName,
      url: getContainerUrl(link.usageKey),
    };

    if (hit.contextKey in acc) {
      if (!(link.usageKey in acc[hit.contextKey].links)) {
        acc[hit.contextKey].links[link.usageKey] = linkData;
        return acc;
      }
    } else {
      acc[hit.contextKey] = {
        key: hit.contextKey,
        contextName: hit.breadcrumbs[0].displayName,
        links: {
          [link.usageKey]: linkData,
        },
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
            <Stack>
              {Object.keys(context.links).map((downstreamUsageKey: string) => (
                <Hyperlink
                  key={downstreamUsageKey}
                  destination={context.links[downstreamUsageKey].url}
                  target="_blank"
                >
                  {context.links[downstreamUsageKey].displayName}
                </Hyperlink>
              ))}
            </Stack>
          </Collapsible>
        ))
      }
    </>
  );
};
