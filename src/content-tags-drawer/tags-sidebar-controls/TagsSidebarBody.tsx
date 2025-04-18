import { useState, useMemo } from 'react';
import {
  Card, Stack, Button, Collapsible, Icon,
} from '@openedx/paragon';
import { ArrowDropDown, ArrowDropUp } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router-dom';
import { ContentTagsDrawerSheet } from '..';

import messages from '../messages';
import { useContentTaxonomyTagsData } from '../data/apiHooks';
import type { ContentTaxonomyTagData, Tag } from '../data/types';
import { LoadingSpinner } from '../../generic/Loading';
import TagsTree from '../TagsTree';

interface TagsSidebarBodyProps {
  readOnly: boolean
}

type TagTree = {
  [key: string]: { children: TagTree, canChangeObjecttag: boolean, canDeleteObjecttag: boolean }
};

const TagsSidebarBody = ({ readOnly }: TagsSidebarBodyProps) => {
  const intl = useIntl();
  const [showManageTags, setShowManageTags] = useState(false);
  const contentId = useParams().blockId;
  const onClose = () => setShowManageTags(false);

  const {
    data: contentTaxonomyTagsData,
    isSuccess: isContentTaxonomyTagsLoaded,
  } = useContentTaxonomyTagsData(contentId || '');

  const buildTagsTree = (contentTags: Tag[]) => {
    const resultTree: TagTree = {};
    contentTags.forEach(item => {
      let currentLevel = resultTree;

      item.lineage.forEach((key) => {
        if (!currentLevel[key]) {
          currentLevel[key] = {
            children: {},
            canChangeObjecttag: item.canChangeObjecttag,
            canDeleteObjecttag: item.canDeleteObjecttag,
          };
        }

        currentLevel = currentLevel[key].children;
      });
    });

    return resultTree;
  };

  const tree = useMemo(() => {
    const result: (Omit<ContentTaxonomyTagData, 'tags'> & { tags: TagTree })[] = [];
    if (isContentTaxonomyTagsLoaded && contentTaxonomyTagsData) {
      contentTaxonomyTagsData.taxonomies.forEach((taxonomy) => {
        result.push({
          ...taxonomy,
          tags: buildTagsTree(taxonomy.tags),
        });
      });
    }
    return result;
  }, [isContentTaxonomyTagsLoaded, contentTaxonomyTagsData]);

  return (
    <>
      <Card.Body
        className="course-unit-sidebar-date tags-sidebar-body pl-2.5"
      >
        <Stack>
          { isContentTaxonomyTagsLoaded
            ? (
              <Stack>
                {tree.map((taxonomy) => (
                  <div key={taxonomy.name}>
                    <Collapsible
                      className="tags-sidebar-taxonomy border-0 .font-weight-bold"
                      styling="card"
                      title={taxonomy.name}
                      iconWhenClosed={<Icon src={ArrowDropDown} />}
                      iconWhenOpen={<Icon src={ArrowDropUp} />}
                    >
                      <TagsTree tags={taxonomy.tags} parentKey={taxonomy.name} />
                    </Collapsible>
                  </div>
                ))}
              </Stack>
            )
            : (
              <div className="d-flex justify-content-center">
                <LoadingSpinner />
              </div>
            )}

          <Button
            className="mt-3 ml-2"
            variant="outline-primary"
            size="sm"
            onClick={() => setShowManageTags(true)}
            disabled={readOnly}
          >
            {intl.formatMessage(messages.manageTagsButton)}
          </Button>
        </Stack>
      </Card.Body>
      <ContentTagsDrawerSheet
        id={contentId}
        onClose={onClose}
        showSheet={showManageTags}
      />
    </>
  );
};

export default TagsSidebarBody;
