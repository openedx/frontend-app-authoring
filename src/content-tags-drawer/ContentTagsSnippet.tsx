import { Chip, Stack } from '@openedx/paragon';
import { Tag as TagIcon } from '@openedx/paragon/icons';

import { useContentTaxonomyTagsData } from './data/apiHooks';
import { Tag } from './data/types';

interface ContentTagsSnippetProps {
  contentId: string;
}

const ContentTagChip = ({ tag }: { tag: Tag }) => {
  let lineageStr = tag.lineage.join(' > ');
  const lineageLength = tag.lineage.length;
  const MAX_TAG_LENGTH = 30;

  if (lineageStr.length > MAX_TAG_LENGTH && lineageLength > 1) {
    if (lineageLength > 2) {
      // NOTE: If the tag lineage is too long and have more than 2 tags, we truncate it to the first and last level
      // i.e "Abilities > Cognitive Abilities > Communication Abilities" becomes
      // "Abilities > .. > Communication Abilities"
      lineageStr = `${tag.lineage[0]} > .. > ${tag.lineage[lineageLength - 1]}`;
    }

    if (lineageStr.length > MAX_TAG_LENGTH) {
      // NOTE: If the tag lineage is still too long, we truncate it only to the last level
      // i.e "Knowledge > .. > Administration and Management" becomes
      // ".. > Administration and Management"
      lineageStr = `.. > ${tag.lineage[lineageLength - 1]}`;
    }
  }

  return (
    <Chip
      iconBefore={TagIcon}
      className="mr-1 tag-snippet-chip"
    >
      {lineageStr}
    </Chip>
  );
};

export const ContentTagsSnippet = ({ contentId }: ContentTagsSnippetProps) => {
  const {
    data,
  } = useContentTaxonomyTagsData(contentId);

  if (!data) {
    return null;
  }

  return (
    <Stack gap={2}>
      {data.taxonomies.map((taxonomy) => (
        <div key={taxonomy.taxonomyId}>
          <h4 className="font-weight-bold x-small text-muted">
            {`${taxonomy.name} (${taxonomy.tags.length})`}
          </h4>
          <div className="d-flex flex-wrap">
            {taxonomy.tags.map((tag) => (
              <ContentTagChip key={tag.value} tag={tag} />
            ))}
          </div>
        </div>
      ))}
    </Stack>
  );
};
