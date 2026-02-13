import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  Button,
  Icon,
  Stack, StandardModal, Tab, Tabs, useToggle,
} from '@openedx/paragon';
import { ChevronLeft, ChevronRight } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { getItemIcon } from '@src/generic/block-type-utils';
import { SidebarContent, SidebarSection, SidebarTitle } from '@src/generic/sidebar';
import { MultiLibraryProvider } from '@src/library-authoring/common/context/MultiLibraryContext';
import { ComponentPicker, SelectedComponent } from '@src/library-authoring';
import { ContentType } from '@src/library-authoring/routes';
import { SidebarFilters } from '@src/library-authoring/library-filters/SidebarFilters';
import { COMPONENT_TYPES } from '@src/generic/block-type-utils/constants';
import { BlockCardButton, BlockTemplate } from '@src/generic/sidebar/BlockCardButton';
import { useWaffleFlags } from '@src/data/apiHooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import EditorPage from '@src/editors/EditorPage';
import VideoSelectorPage from '@src/editors/VideoSelectorPage';
import { useIframe } from '@src/generic/hooks/context/hooks';
import { ProblemTypeKeys } from '@src/editors/data/constants/problem';
import problemMessages from '@src/editors/containers/ProblemEditor/components/SelectTypeModal/content/messages';

import { getCourseSectionVertical, getCourseUnitData } from '../data/selectors';
import { useUnitSidebarContext } from './UnitSidebarContext';
import messages from './messages';
import { useHandleCreateNewCourseXBlock } from '../hooks';
import { messageTypes } from '../constants';
import { fetchCourseSectionVerticalData } from '../data/thunk';

/**
 * Tab of the add sidebar to add new content to the unit
 */
const AddNewContent = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { sendMessageToIframe } = useIframe();
  const { blockId } = useParams();
  const { courseId } = useCourseAuthoringContext();
  const courseUnit = useSelector(getCourseUnitData);
  const { componentTemplates = {} } = useSelector(getCourseSectionVertical);
  const [blockType, setBlockType] = useState<string | null>(null);
  const [newBlockId, setNewBlockId] = useState<string | null>(null);
  const [editorExtraProps, setEditorExtraProps] = useState<Record<string, any> | null>(null);
  const { useVideoGalleryFlow } = useWaffleFlags(courseId ?? undefined);
  const [isXBlockEditorModalOpen, showXBlockEditorModal, closeXBlockEditorModal] = useToggle();
  const [isVideoSelectorModalOpen, showVideoSelectorModal, closeVideoSelectorModal] = useToggle();
  const [isAdvancedPageOpen, showAdvancedPage, closeAdvancedPage] = useToggle();

  /** The ID of the subsection (`sequential`) that is the parent of the unit we're adding to */
  const parentSubsectionId = courseUnit?.ancestorInfo?.ancestors?.[0]?.id;

  // Build problem templates
  const problemTemplates: BlockTemplate[] = [];
  Object.values(ProblemTypeKeys).map((key) => (
    problemTemplates.push({
      displayName: intl.formatMessage(problemMessages[`problemType.${key}.title`]),
      boilerplateName: key,
    })
  ));

  // Pre-process block templates
  const templatesByType = componentTemplates.reduce((acc, item) => {
    let result = item;
    // (1) All types have at least one template of the same type.
    //     In that case, it's left empty to avoid rendering that single template.
    // (2) Set the problem templates required for this component.
    if (item.type === 'problem') {
      result = {
        ...item,
        templates: problemTemplates,
      };
    } else if (item.templates.length === 1) {
      result = {
        ...item,
        templates: [],
      };
    }

    return {
      ...acc,
      [item.type]: result,
    };
  }, {});

  if (courseId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing courseId.');
  }

  if (blockId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing blockId.');
  }

  const handleCreateXBlock = useHandleCreateNewCourseXBlock({ blockId });

  const onXBlockSave = useCallback(/* istanbul ignore next */ () => {
    closeXBlockEditorModal();
    closeVideoSelectorModal();
    sendMessageToIframe(messageTypes.refreshXBlock, null);
    dispatch(fetchCourseSectionVerticalData(blockId, parentSubsectionId));
  }, [closeXBlockEditorModal, sendMessageToIframe]);

  const onXBlockCancel = useCallback(/* istanbul ignore next */ () => {
    closeXBlockEditorModal();
    closeVideoSelectorModal();
    dispatch(fetchCourseSectionVerticalData(blockId, parentSubsectionId));
  }, [closeXBlockEditorModal, sendMessageToIframe, blockId, parentSubsectionId]);

  /* eslint-disable no-void */
  const handleSelection = useCallback((type: string, moduleName?: string) => {
    switch (type) {
      case COMPONENT_TYPES.dragAndDrop:
        void handleCreateXBlock({ type, parentLocator: blockId });
        break;
      case COMPONENT_TYPES.problem:
        void handleCreateXBlock({ type, parentLocator: blockId }, ({ locator }) => {
          setEditorExtraProps({ problemType: moduleName });
          setBlockType(type);
          setNewBlockId(locator);
          showXBlockEditorModal();
        });
        break;
      case COMPONENT_TYPES.video:
        void handleCreateXBlock(
          { type, parentLocator: blockId },
          /* istanbul ignore next */ ({ locator }) => {
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
      case COMPONENT_TYPES.openassessment:
        void handleCreateXBlock({ boilerplate: moduleName, category: type, parentLocator: blockId });
        break;
      case COMPONENT_TYPES.html:
        void handleCreateXBlock({
          type,
          boilerplate: moduleName,
          parentLocator: blockId,
        }, /* istanbul ignore next */ ({ locator }) => {
          setBlockType(type);
          setNewBlockId(locator);
          showXBlockEditorModal();
        });
        break;
      case COMPONENT_TYPES.advanced:
        void handleCreateXBlock({ type: moduleName, category: moduleName, parentLocator: blockId });
        break;
      /* istanbul ignore next */
      default:
        break;
    }
  }, [blockId]);

  const blockTypes = [
    {
      blockType: 'html',
      name: intl.formatMessage(messages.sidebarAddTextButton),
    },
    {
      blockType: 'video',
      name: intl.formatMessage(messages.sidebarAddVideoButton),
    },
    {
      blockType: 'problem',
      name: intl.formatMessage(messages.sidebarAddProblemButton),
    },
    {
      blockType: 'drag-and-drop-v2',
      name: intl.formatMessage(messages.sidebarAddDragDropButton),
    },
    {
      blockType: 'openassessment',
      name: intl.formatMessage(messages.sidebarAddOpenResponseButton),
    },
  ];

  // Render add advanced blocks page
  if (isAdvancedPageOpen) {
    return (
      <Stack>
        <Stack className="mb-2 text-primary-500" direction="horizontal" gap={1}>
          <Button
            className="text-primary-500"
            variant="tertiary"
            iconBefore={ChevronLeft}
            onClick={closeAdvancedPage}
          >
            <FormattedMessage {...messages.sidebarAddBackButton} />
          </Button>
          <Icon src={ChevronRight} />
          <FormattedMessage {...messages.sidebarAddAdvancedBlocksTitle} />
        </Stack>
        <Stack gap={2}>
          {templatesByType.advanced?.templates.map((advancedTypeObj) => (
            <BlockCardButton
              blockType={advancedTypeObj.category}
              name={advancedTypeObj.displayName}
              onClick={() => handleSelection('advanced', advancedTypeObj.category)}
            />
          ))}
        </Stack>
      </Stack>
    );
  }

  // Render add default blocks page
  return (
    <>
      <Stack gap={2}>
        {blockTypes.map((blockTypeObj) => (
          <BlockCardButton
            {...blockTypeObj}
            templates={templatesByType[blockTypeObj.blockType].templates}
            onClick={() => handleSelection(blockTypeObj.blockType)}
            onClickTemplate={(boilerplateName: string) => handleSelection(blockTypeObj.blockType, boilerplateName)}
          />
        ))}
        {templatesByType.advanced?.templates?.length > 0 && (
          <BlockCardButton
            blockType="advanced"
            name={intl.formatMessage(messages.sidebarAddAdvancedButton)}
            onClick={showAdvancedPage}
            actionIcon={<Icon src={ChevronRight} />}
          />
        )}
      </Stack>
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
            extraProps={editorExtraProps}
          />
        </div>
      )}
    </>
  );
};

/**
 * Tab of the add sidebar to add a content library in the unit
 *
 * Uses `ComponentPicker`
 */
const AddLibraryContent = () => {
  const { blockId } = useParams();

  if (blockId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing blockId.');
  }

  const handleCreateXBlock = useHandleCreateNewCourseXBlock({ blockId });

  const handleSelection = useCallback(async (selection: SelectedComponent) => {
    await handleCreateXBlock({
      type: COMPONENT_TYPES.libraryV2,
      category: selection.blockType,
      parentLocator: blockId,
      libraryContentKey: selection.usageKey,
    });
  }, [blockId]);

  return (
    <MultiLibraryProvider>
      <ComponentPicker
        showOnlyPublished
        extraFilter={['type = "library_block"']}
        visibleTabs={[ContentType.home]}
        FiltersComponent={SidebarFilters}
        onComponentSelected={handleSelection}
      />
    </MultiLibraryProvider>
  );
};

/**
 * Main component of the Add Sidebar for the unit page
 */
export const AddSidebar = () => {
  const intl = useIntl();
  const unitData = useSelector(getCourseUnitData);

  const {
    currentTabKey,
    setCurrentTabKey,
  } = useUnitSidebarContext();

  useEffect(() => {
    if (currentTabKey === undefined) {
      // Set default Tab key
      setCurrentTabKey('add-new');
    }
  }, []);

  return (
    <div>
      <SidebarTitle
        title={unitData.displayName}
        icon={getItemIcon('unit')}
      />
      <SidebarContent>
        <SidebarSection>
          <Tabs
            id="unit-add-sidebar"
            className="mb-2 mx-n4.5 mx-n3.5"
            activeKey={currentTabKey}
            onSelect={setCurrentTabKey}
          >
            <Tab
              eventKey="add-new"
              title={intl.formatMessage(messages.sidebarAddNewTab)}
            >
              <div className="mt-4">
                <AddNewContent />
              </div>
            </Tab>
            <Tab
              eventKey="add-existing"
              title={intl.formatMessage(messages.sidebarAddExistingTab)}
            >
              <div className="mt-4">
                <AddLibraryContent />
              </div>
            </Tab>
          </Tabs>
        </SidebarSection>
      </SidebarContent>
    </div>
  );
};
