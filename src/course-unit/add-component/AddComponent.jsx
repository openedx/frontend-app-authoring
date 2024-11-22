import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Button, StandardModal, useToggle,
} from '@openedx/paragon';

import { getCourseSectionVertical } from '../data/selectors';
import { COMPONENT_TYPES } from '../../generic/block-type-utils/constants';
import ComponentModalView from './add-component-modals/ComponentModalView';
import AddComponentButton from './add-component-btn';
import messages from './messages';
import { ComponentPicker } from '../../library-authoring/component-picker';
import { messageTypes } from '../constants';
import { useIframe } from '../context/hooks';
import { useEventListener } from '../../generic/hooks';

const AddComponent = ({ blockId, handleCreateNewCourseXBlock }) => {
  const navigate = useNavigate();
  const intl = useIntl();
  const [isOpenAdvanced, openAdvanced, closeAdvanced] = useToggle(false);
  const [isOpenHtml, openHtml, closeHtml] = useToggle(false);
  const [isOpenOpenAssessment, openOpenAssessment, closeOpenAssessment] = useToggle(false);
  const { componentTemplates } = useSelector(getCourseSectionVertical);
  const [isAddLibraryContentModalOpen, showAddLibraryContentModal, closeAddLibraryContentModal] = useToggle();
  const [isSelectLibraryContentModalOpen, showSelectLibraryContentModal, closeSelectLibraryContentModal] = useToggle();
  const [selectedComponents, setSelectedComponents] = useState([]);
  const { sendMessageToIframe } = useIframe();

  const receiveMessage = useCallback(({ data: { type } }) => {
    if (type === messageTypes.showMultipleComponentPicker) {
      showSelectLibraryContentModal();
    }
  }, [showSelectLibraryContentModal]);

  useEventListener('message', receiveMessage);

  const onComponentSelectionSubmit = useCallback(() => {
    sendMessageToIframe(messageTypes.addSelectedComponentsToBank, { selectedComponents });
    closeSelectLibraryContentModal();
  }, [selectedComponents]);

  const handleLibraryV2Selection = useCallback((selection) => {
    handleCreateNewCourseXBlock({
      type: COMPONENT_TYPES.libraryV2,
      category: selection.blockType,
      parentLocator: blockId,
      libraryContentKey: selection.usageKey,
    });
    closeAddLibraryContentModal();
  }, []);

  const handleCreateNewXBlock = (type, moduleName) => {
    switch (type) {
      case COMPONENT_TYPES.discussion:
      case COMPONENT_TYPES.dragAndDrop:
        handleCreateNewCourseXBlock({ type, parentLocator: blockId });
        break;
      case COMPONENT_TYPES.problem:
      case COMPONENT_TYPES.video:
        handleCreateNewCourseXBlock({ type, parentLocator: blockId }, ({ courseKey, locator }) => {
          navigate(`/course/${courseKey}/editor/${type}/${locator}`);
        });
        break;
        // TODO: The library functional will be a bit different of current legacy (CMS)
        //  behaviour and this ticket is on hold (blocked by other development team).
      case COMPONENT_TYPES.library:
        handleCreateNewCourseXBlock({ type, category: 'library_content', parentLocator: blockId });
        break;
      case COMPONENT_TYPES.itembank:
        handleCreateNewCourseXBlock({ type, category: 'itembank', parentLocator: blockId });
        break;
      case COMPONENT_TYPES.libraryV2:
        showAddLibraryContentModal();
        break;
      case COMPONENT_TYPES.advanced:
        handleCreateNewCourseXBlock({
          type: moduleName, category: moduleName, parentLocator: blockId,
        });
        break;
      case COMPONENT_TYPES.openassessment:
        handleCreateNewCourseXBlock({
          boilerplate: moduleName, category: type, parentLocator: blockId,
        });
        break;
      case COMPONENT_TYPES.html:
        handleCreateNewCourseXBlock({
          type,
          boilerplate: moduleName,
          parentLocator: blockId,
        }, ({ courseKey, locator }) => {
          navigate(`/course/${courseKey}/editor/html/${locator}`);
        });
        break;
      default:
    }
  };

  if (!Object.keys(componentTemplates).length) {
    return null;
  }

  return (
    <div className="py-4">
      <h5 className="h3 mb-4 text-center">{intl.formatMessage(messages.title)}</h5>
      <ul className="new-component-type list-unstyled m-0 d-flex flex-wrap justify-content-center">
        {componentTemplates.map((component) => {
          const { type, displayName, beta } = component;
          let modalParams;

          if (!component.templates.length) {
            return null;
          }

          switch (type) {
            case COMPONENT_TYPES.advanced:
              modalParams = {
                open: openAdvanced,
                close: closeAdvanced,
                isOpen: isOpenAdvanced,
              };
              break;
            case COMPONENT_TYPES.html:
              modalParams = {
                open: openHtml,
                close: closeHtml,
                isOpen: isOpenHtml,
              };
              break;
            case COMPONENT_TYPES.openassessment:
              modalParams = {
                open: openOpenAssessment,
                close: closeOpenAssessment,
                isOpen: isOpenOpenAssessment,
              };
              break;
            default:
              return (
                <li key={type}>
                  <AddComponentButton
                    onClick={() => handleCreateNewXBlock(type)}
                    displayName={displayName}
                    type={type}
                    beta={beta}
                  />
                </li>
              );
          }

          return (
            <ComponentModalView
              key={type}
              component={component}
              handleCreateNewXBlock={handleCreateNewXBlock}
              modalParams={modalParams}
            />
          );
        })}
      </ul>
      <StandardModal
        title={
          isAddLibraryContentModalOpen
            ? intl.formatMessage(messages.singleComponentPickerModalTitle)
            : intl.formatMessage(messages.multipleComponentPickerModalTitle)
        }
        isOpen={isAddLibraryContentModalOpen || isSelectLibraryContentModalOpen}
        onClose={() => {
          closeAddLibraryContentModal();
          closeSelectLibraryContentModal();
        }}
        isOverflowVisible={false}
        size="xl"
        footerNode={
          isSelectLibraryContentModalOpen && (
          <ActionRow>
            <Button variant="primary" onClick={onComponentSelectionSubmit}>
              <FormattedMessage {...messages.multipleComponentPickerModalBtn} />
            </Button>
          </ActionRow>
          )
        }
      >
        <ComponentPicker
          showOnlyPublished
          componentPickerMode={isAddLibraryContentModalOpen ? 'single' : 'multiple'}
          onComponentSelected={handleLibraryV2Selection}
          onChangeComponentSelection={setSelectedComponents}
        />
      </StandardModal>
    </div>
  );
};

AddComponent.propTypes = {
  blockId: PropTypes.string.isRequired,
  handleCreateNewCourseXBlock: PropTypes.func.isRequired,
};

export default AddComponent;
