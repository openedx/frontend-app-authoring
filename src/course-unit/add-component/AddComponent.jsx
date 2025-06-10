import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Button, StandardModal, useToggle,
} from '@openedx/paragon';

import { getCourseSectionVertical } from '../data/selectors';
import { getWaffleFlags } from '../../data/selectors';
import { COMPONENT_TYPES } from '../../generic/block-type-utils/constants';
import ComponentModalView from './add-component-modals/ComponentModalView';
import AddComponentButton from './add-component-btn';
import messages from './messages';
import { ComponentPicker } from '../../library-authoring/component-picker';
import { messageTypes } from '../constants';
import { useIframe } from '../../generic/hooks/context/hooks';
import { useEventListener } from '../../generic/hooks';
import VideoSelectorPage from '../../editors/VideoSelectorPage';
import EditorPage from '../../editors/EditorPage';

const AddComponent = ({
  parentLocator,
  isSplitTestType,
  isUnitVerticalType,
  addComponentTemplateData,
  handleCreateNewCourseXBlock,
}) => {
  const intl = useIntl();
  const [isOpenAdvanced, openAdvanced, closeAdvanced] = useToggle(false);
  const [isOpenHtml, openHtml, closeHtml] = useToggle(false);
  const [isOpenOpenAssessment, openOpenAssessment, closeOpenAssessment] = useToggle(false);
  const { componentTemplates = {} } = useSelector(getCourseSectionVertical);
  const blockId = addComponentTemplateData.parentLocator || parentLocator;
  const [isAddLibraryContentModalOpen, showAddLibraryContentModal, closeAddLibraryContentModal] = useToggle();
  const [isVideoSelectorModalOpen, showVideoSelectorModal, closeVideoSelectorModal] = useToggle();
  const [isXBlockEditorModalOpen, showXBlockEditorModal, closeXBlockEditorModal] = useToggle();

  const [blockType, setBlockType] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [newBlockId, setNewBlockId] = useState(null);
  const [isSelectLibraryContentModalOpen, showSelectLibraryContentModal, closeSelectLibraryContentModal] = useToggle();
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [usageId, setUsageId] = useState(null);
  const { sendMessageToIframe } = useIframe();
  const { useVideoGalleryFlow, useReactMarkdownEditor } = useSelector(getWaffleFlags);

  const receiveMessage = useCallback(({ data: { type, payload } }) => {
    if (type === messageTypes.showMultipleComponentPicker) {
      showSelectLibraryContentModal();
    }
    if (type === messageTypes.showSingleComponentPicker) {
      setUsageId(payload.usageId);
      showAddLibraryContentModal();
    }
  }, [showSelectLibraryContentModal, showAddLibraryContentModal, setUsageId]);

  useEventListener('message', receiveMessage);

  const onComponentSelectionSubmit = useCallback(() => {
    sendMessageToIframe(messageTypes.addSelectedComponentsToBank, { selectedComponents });
    closeSelectLibraryContentModal();
  }, [selectedComponents]);

  const onXBlockSave = useCallback(/* istanbul ignore next */ () => {
    closeXBlockEditorModal();
    closeVideoSelectorModal();
    sendMessageToIframe(messageTypes.refreshXBlock, null);
  }, [closeXBlockEditorModal, closeVideoSelectorModal, sendMessageToIframe]);

  const handleLibraryV2Selection = useCallback((selection) => {
    handleCreateNewCourseXBlock({
      type: COMPONENT_TYPES.libraryV2,
      category: selection.blockType,
      parentLocator: usageId || blockId,
      libraryContentKey: selection.usageKey,
    });
    closeAddLibraryContentModal();
  }, [usageId]);

  const handleCreateNewXBlock = (type, moduleName) => {
    switch (type) {
      case COMPONENT_TYPES.discussion:
      case COMPONENT_TYPES.dragAndDrop:
        handleCreateNewCourseXBlock({ type, parentLocator: blockId });
        break;
      case COMPONENT_TYPES.problem:
        handleCreateNewCourseXBlock({ type, parentLocator: blockId }, ({ courseKey, locator }) => {
          setCourseId(courseKey);
          setBlockType(type);
          setNewBlockId(locator);
          showXBlockEditorModal();
        });
        break;
      case COMPONENT_TYPES.video:
        handleCreateNewCourseXBlock(
          { type, parentLocator: blockId },
          /* istanbul ignore next */ ({ courseKey, locator }) => {
            setCourseId(courseKey);
            setBlockType(type);
            setNewBlockId(locator);
            if (useVideoGalleryFlow) {
              showVideoSelectorModal();
            } else {
              showXBlockEditorModal();
            }
          },
        );
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
        handleCreateNewCourseXBlock({ type: moduleName, category: moduleName, parentLocator: blockId });
        break;
      case COMPONENT_TYPES.openassessment:
        handleCreateNewCourseXBlock({ boilerplate: moduleName, category: type, parentLocator: blockId });
        break;
      case COMPONENT_TYPES.html:
        handleCreateNewCourseXBlock({
          type,
          boilerplate: moduleName,
          parentLocator: blockId,
        }, /* istanbul ignore next */ ({ courseKey, locator }) => {
          setCourseId(courseKey);
          setBlockType(type);
          setNewBlockId(locator);
          showXBlockEditorModal();
        });
        break;
      default:
    }
  };

  if (isUnitVerticalType || isSplitTestType) {
    return (
      <div className="py-4">
        {Object.keys(componentTemplates).length && isUnitVerticalType ? (
          <>
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
          </>
        ) : null}
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
                <Button onClick={onComponentSelectionSubmit}>
                  <FormattedMessage {...messages.multipleComponentPickerModalBtn} />
                </Button>
              </ActionRow>
            )
          }
        >
          <ComponentPicker
            showOnlyPublished
            extraFilter={['NOT block_type = "unit"']}
            componentPickerMode={isAddLibraryContentModalOpen ? 'single' : 'multiple'}
            onComponentSelected={handleLibraryV2Selection}
            onChangeComponentSelection={setSelectedComponents}
          />
        </StandardModal>
        <StandardModal
          title={intl.formatMessage(messages.videoPickerModalTitle)}
          isOpen={isVideoSelectorModalOpen}
          onClose={closeVideoSelectorModal}
          isOverflowVisible={false}
          size="xl"
        >
          <div className="selector-page">
            <VideoSelectorPage
              blockId={newBlockId}
              courseId={courseId}
              studioEndpointUrl={getConfig().STUDIO_BASE_URL}
              lmsEndpointUrl={getConfig().LMS_BASE_URL}
              onCancel={closeVideoSelectorModal}
              returnFunction={/* istanbul ignore next */ () => onXBlockSave}
            />
          </div>
        </StandardModal>
        {isXBlockEditorModalOpen && (
          <div className="editor-page">
            <EditorPage
              courseId={courseId}
              blockType={blockType}
              blockId={newBlockId}
              isMarkdownEditorEnabledForCourse={useReactMarkdownEditor}
              studioEndpointUrl={getConfig().STUDIO_BASE_URL}
              lmsEndpointUrl={getConfig().LMS_BASE_URL}
              onClose={closeXBlockEditorModal}
              returnFunction={/* istanbul ignore next */ () => onXBlockSave}
            />
          </div>
        )}
      </div>
    );
  }

  return null;
};

AddComponent.propTypes = {
  isSplitTestType: PropTypes.bool.isRequired,
  isUnitVerticalType: PropTypes.bool.isRequired,
  parentLocator: PropTypes.string.isRequired,
  handleCreateNewCourseXBlock: PropTypes.func.isRequired,
  addComponentTemplateData: {
    blockId: PropTypes.string.isRequired,
    model: PropTypes.shape({
      displayName: PropTypes.string.isRequired,
      category: PropTypes.string,
      type: PropTypes.string.isRequired,
      templates: PropTypes.arrayOf(
        PropTypes.shape({
          boilerplateName: PropTypes.string,
          category: PropTypes.string,
          displayName: PropTypes.string.isRequired,
          supportLevel: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        }),
      ),
      supportLegend: PropTypes.shape({
        allowUnsupportedXblocks: PropTypes.bool,
        documentationLabel: PropTypes.string,
        showLegend: PropTypes.bool,
      }),
    }),
  },
};

export default AddComponent;
