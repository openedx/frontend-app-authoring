import { useState, useMemo } from 'react';
import {
  Card, Stack, Button, Sheet, Collapsible, Icon,
} from '@openedx/paragon';
import { ArrowDropDown, ArrowDropUp } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router-dom';
import { ContentTagsDrawer } from '..';

import messages from '../messages';
import { useContentTaxonomyTagsData } from '../data/apiHooks';
import { LoadingSpinner } from '../../generic/Loading';
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
                      className="tags-sidebar-taxonomy"
                      styling="card"
                      title={taxonomy.name}
                      iconWhenClosed={<Icon src={ArrowDropDown} />}
                      iconWhenOpen={<Icon src={ArrowDropUp} />}
                    >
                      <TagsTree tags={taxonomy.tags} />
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

          <Button className="mt-3 ml-2" variant="outline-primary" onClick={() => setShowManageTags(true)}>
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
