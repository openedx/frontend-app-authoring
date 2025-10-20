import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Button, StandardModal, useToggle,
} from '@openedx/paragon';

import { useWaffleFlags } from '@src/data/apiHooks';
import { COMPONENT_TYPES } from '@src/generic/block-type-utils/constants';
import { ComponentPicker } from '@src/library-authoring/component-picker';
import { ContentType } from '@src/library-authoring/routes';
import { useIframe } from '@src/generic/hooks/context/hooks';
import { useEventListener } from '@src/generic/hooks';
import VideoSelectorPage from '@src/editors/VideoSelectorPage';
import EditorPage from '@src/editors/EditorPage';
import { SelectedComponent } from '@src/library-authoring';
import { fetchCourseSectionVerticalData } from '../data/thunk';
import { messageTypes } from '../constants';
import messages from './messages';
import AddComponentButton from './add-component-btn';
import ComponentModalView from './add-component-modals/ComponentModalView';
import { getCourseSectionVertical, getCourseUnitData } from '../data/selectors';

type ComponentTemplateData = {
  displayName: string,
  category?: string,
  type: string,
  beta?: boolean,
  templates: Array<{
    boilerplateName?: string,
    category?: string,
    displayName: string,
    supportLevel?: string | boolean,
  }>,
  supportLegend: {
    allowUnsupportedXblocks?: boolean,
    documentationLabel?: string,
    showLegend?: boolean,
  },
};

export interface AddComponentProps {
  isSplitTestType?: boolean,
  isUnitVerticalType?: boolean,
  parentLocator: string,
  handleCreateNewCourseXBlock: (
    args: object,
    callback?: (args: { courseKey: string, locator: string }) => void
  ) => void,
  isProblemBankType?: boolean,
  addComponentTemplateData?: {
    blockId: string,
    parentLocator?: string,
    model: ComponentTemplateData,
  },
}

const AddComponent = ({
  parentLocator,
  isSplitTestType,
  isUnitVerticalType,
  isProblemBankType,
  addComponentTemplateData,
  handleCreateNewCourseXBlock,
}: AddComponentProps) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const [isOpenAdvanced, openAdvanced, closeAdvanced] = useToggle(false);
  const [isOpenHtml, openHtml, closeHtml] = useToggle(false);
  const [isOpenOpenAssessment, openOpenAssessment, closeOpenAssessment] = useToggle(false);
  const { componentTemplates = {} } = useSelector(getCourseSectionVertical);
  const blockId = addComponentTemplateData?.parentLocator || parentLocator;
  const [isAddLibraryContentModalOpen, showAddLibraryContentModal, closeAddLibraryContentModal] = useToggle();
  const [isVideoSelectorModalOpen, showVideoSelectorModal, closeVideoSelectorModal] = useToggle();
  const [isXBlockEditorModalOpen, showXBlockEditorModal, closeXBlockEditorModal] = useToggle();

  const [blockType, setBlockType] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [newBlockId, setNewBlockId] = useState<string | null>(null);
  const [isSelectLibraryContentModalOpen, showSelectLibraryContentModal, closeSelectLibraryContentModal] = useToggle();
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponent[]>([]);
  const [usageId, setUsageId] = useState(null);
  const { sendMessageToIframe } = useIframe();
  const { useVideoGalleryFlow } = useWaffleFlags(courseId ?? undefined);

  const courseUnit = useSelector(getCourseUnitData);
  const sequenceId = courseUnit?.ancestorInfo?.ancestors?.[0]?.id;

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
    dispatch(fetchCourseSectionVerticalData(blockId, sequenceId));
  }, [closeXBlockEditorModal, closeVideoSelectorModal, sendMessageToIframe]);

  const onXBlockCancel = useCallback(/* istanbul ignore next */ () => {
    // ignoring tests because it triggers when someone closes the editor which has a separate store
    closeXBlockEditorModal();
    closeVideoSelectorModal();
    dispatch(fetchCourseSectionVerticalData(blockId, sequenceId));
  }, [closeXBlockEditorModal, closeVideoSelectorModal, sendMessageToIframe, blockId, sequenceId]);

  const handleLibraryV2Selection = useCallback((selection: SelectedComponent) => {
    handleCreateNewCourseXBlock({
      type: COMPONENT_TYPES.libraryV2,
      category: selection.blockType,
      parentLocator: usageId || blockId,
      libraryContentKey: selection.usageKey,
    });
    closeAddLibraryContentModal();
  }, [usageId]);

  const handleCreateNewXBlock = (type: string, moduleName?: string) => {
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

  if (isUnitVerticalType || isSplitTestType || isProblemBankType) {
    return (
      <div className="py-4">
        {Object.keys(componentTemplates).length && isUnitVerticalType ? (
          <>
            <h5 className="h3 mb-4 text-center">{intl.formatMessage(messages.title)}</h5>
            <ul className="new-component-type list-unstyled m-0 d-flex flex-wrap justify-content-center">
              {componentTemplates.map((component: ComponentTemplateData) => {
                const { type, displayName, beta } = component;
                let modalParams: { open: () => void, close: () => void, isOpen: boolean };

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
            extraFilter={['NOT block_type = "unit"', 'NOT block_type = "section"', 'NOT block_type = "subsection"']}
            visibleTabs={[ContentType.home, ContentType.components, ContentType.collections]}
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
        {isXBlockEditorModalOpen && courseId && blockType && newBlockId && (
          <div className="editor-page">
            <EditorPage
              courseId={courseId}
              blockType={blockType}
              blockId={newBlockId}
              studioEndpointUrl={getConfig().STUDIO_BASE_URL}
              lmsEndpointUrl={getConfig().LMS_BASE_URL}
              onClose={onXBlockCancel}
              returnFunction={/* istanbul ignore next */ () => onXBlockSave}
            />
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default AddComponent;
