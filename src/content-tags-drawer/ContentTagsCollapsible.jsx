import React from 'react';
import {
  Badge,
  Collapsible,
  SelectableBox,
  Button,
  ModalPopup,
  useToggle,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import messages from './messages';
import './ContentTagsCollapsible.scss';

import ContentTagsDropDownSelector from './ContentTagsDropDownSelector';

import ContentTagsTree from './ContentTagsTree';

/**
 * Collapsible component that holds a Taxonomy along with Tags that belong to it.
 * This includes both applied tags and tags that are available to select
 * from a dropdown list.
 * @param {Object} taxonomyAndTagsData - Object containing Taxonomy meta data along with applied tags
 * @param {number} taxonomyAndTagsData.id - id of Taxonomy
 * @param {string} taxonomyAndTagsData.name - name of Taxonomy
 * @param {string} taxonomyAndTagsData.description - description of Taxonomy
 * @param {boolean} taxonomyAndTagsData.enabled - Whether Taxonomy is enabled/disabled
 * @param {boolean} taxonomyAndTagsData.allowMultiple - Whether Taxonomy allows multiple tags to be applied
 * @param {boolean} taxonomyAndTagsData.allowFreeText - Whether Taxonomy allows free text tags
 * @param {boolean} taxonomyAndTagsData.systemDefined - Whether Taxonomy is system defined or authored by user
 * @param {boolean} taxonomyAndTagsData.visibleToAuthors - Whether Taxonomy should be visible to object authors
 * @param {string[]} taxonomyAndTagsData.orgs - Array of orgs this Taxonomy belongs to
 * @param {boolean} taxonomyAndTagsData.allOrgs - Whether Taxonomy belongs to all orgs
 * @param {Object[]} taxonomyAndTagsData.contentTags - Array of taxonomy tags that are applied to the content
 * @param {string} taxonomyAndTagsData.contentTags.value - Value of applied Tag
 * @param {string} taxonomyAndTagsData.contentTags.lineage - Array of Tag's ancestors sorted (ancestor -> tag)
 */
const ContentTagsCollapsible = ({ taxonomyAndTagsData }) => {
  const intl = useIntl();
  const {
    id, name, contentTags,
  } = taxonomyAndTagsData;

  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = React.useState(null);

  return (
    <div className="d-flex">
      <Collapsible title={name} styling="card-lg" className="taxonomy-tags-collapsible">
        <div key={id}>
          <ContentTagsTree appliedContentTags={contentTags} />
        </div>

        <div className="d-flex taxonomy-tags-selector-menu">
          <Button
            ref={setTarget}
            variant="outline-primary"
            onClick={open}
          >
            <FormattedMessage {...messages.addTagsButtonText} />
          </Button>
        </div>
        <ModalPopup
          hasArrow
          placement="bottom"
          positionRef={target}
          isOpen={isOpen}
          onClose={close}
        >
          <div className="bg-white p-3 shadow">

            <SelectableBox.Set
              type="checkbox"
              name="tags"
              columns={1}
              ariaLabel={intl.formatMessage(messages.taxonomyTagsAriaLabel)}
              className="taxonomy-tags-selectable-box-set"
            >
              <ContentTagsDropDownSelector
                key={`selector-${id}`}
                taxonomyId={id}
                level={0}
              />
            </SelectableBox.Set>
          </div>
        </ModalPopup>

      </Collapsible>
      <div className="d-flex">
        <Badge
          variant="light"
          pill
          className={classNames('align-self-start', 'mt-3', {
            // eslint-disable-next-line quote-props
            'invisible': contentTags.length === 0,
          })}
        >
          {contentTags.length}
        </Badge>
      </div>
    </div>
  );
};

ContentTagsCollapsible.propTypes = {
  taxonomyAndTagsData: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    contentTags: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string,
      lineage: PropTypes.arrayOf(PropTypes.string),
    })),
  }).isRequired,
};

export default ContentTagsCollapsible;
