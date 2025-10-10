import { useMemo } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Collapsible, Hyperlink, Stack } from '@openedx/paragon';

import { useEntityLinks } from '@src/course-libraries/data/apiHooks';
import AlertError from '@src/generic/alert-error';
import Loading from '@src/generic/Loading';

import messages from './messages';
import { useContentFromSearchIndex } from '../data/apiHooks';

interface ComponentUsageProps {
  usageKey: string;
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

export const ComponentUsage = ({ usageKey }: ComponentUsageProps) => {
  const {
    data: dataDownstreamLinks,
    isError: isErrorDownstreamLinks,
    error: errorDownstreamLinks,
    isPending: isPendingDownstreamLinks,
  } = useEntityLinks({ upstreamKey: usageKey, contentType: 'components' });

  const downstreamKeys = useMemo(
    () => dataDownstreamLinks?.map(link => link.downstreamUsageKey) || [],
    [dataDownstreamLinks],
  );

  const {
    hits: downstreamHits,
    isError: isErrorIndexDocuments,
    error: errorIndexDocuments,
    isPending: isPendingIndexDocuments,
  } = useContentFromSearchIndex(downstreamKeys);

  if (isErrorDownstreamLinks || isErrorIndexDocuments) {
    return <AlertError error={errorDownstreamLinks || errorIndexDocuments} />;
  }

  if (isPendingDownstreamLinks || (isPendingIndexDocuments && !!downstreamKeys.length)) {
    return <Loading />;
  }

  if (!downstreamKeys.length || !downstreamHits) {
    return <FormattedMessage {...messages.detailsTabUsageEmpty} />;
  }

  const componentUsage = downstreamHits.reduce<ComponentUsageTree>((acc, hit) => {
    const link = hit.breadcrumbs.at(-1) as { displayName: string, usageKey: string };
    // istanbul ignore if: this should never happen. it is a type guard for the breadcrumb last item
    if (!link?.usageKey) {
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
