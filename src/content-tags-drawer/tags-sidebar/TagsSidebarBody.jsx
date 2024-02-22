import { useState, useMemo } from 'react';
import {
  Card, Stack, Button, Sheet, Collapsible
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router-dom';
import { ContentTagsDrawer } from '..';

import messages from '../messages';
import { useContentTaxonomyTagsData } from '../data/apiHooks';
import Loading from '../../generic/Loading';
import TagsTree from './TagsTree';

const TagsSidebarBody = () => {
  const intl = useIntl();
  const [showManageTags, setShowManageTags] = useState(false);
  const contentId = useParams().blockId;
  const onClose = () => setShowManageTags(false);

  const {
    data: contentTaxonomyTagsData,
    isSuccess: isContentTaxonomyTagsLoaded,
  } = useContentTaxonomyTagsData(contentId);

  const buildTagsTree = (contentTags) => {
    const resultTree = {};
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
    const result = [];
    if (contentTaxonomyTagsData) {
      contentTaxonomyTagsData.taxonomies.forEach((taxonomy) => {
        result.push({
          ...taxonomy,
          tags: buildTagsTree(taxonomy.tags),
        });
      });
    }
    return result;
  }, [contentTaxonomyTagsData]);

  return (
    <>
      <Card.Body className="course-unit-sidebar-date tags-sidebar-body">
        <Stack>
          { isContentTaxonomyTagsLoaded
            ? (
              <Stack>
                {tree.map((taxonomy) => (
                  <div>
                    <Collapsible
                      className='tags-sidebar-taxonomy'
                      styling='basic'
                      title={taxonomy.name}
                    >
                      <TagsTree tags={taxonomy.tags} />
                    </Collapsible>
                  </div>
                ))}
              </Stack>
            )
            : <Loading />}

          <Button variant="outline-primary" onClick={() => setShowManageTags(true)}>
            {intl.formatMessage(messages.manageTagsButton)}
          </Button>
        </Stack>
      </Card.Body>
      <Sheet
        position="right"
        show={showManageTags}
        onClose={onClose}
      >
        <ContentTagsDrawer
          id={contentId}
          onClose={onClose}
        />
      </Sheet>
    </>
  );
};

TagsSidebarBody.propTypes = {};

export default TagsSidebarBody;
