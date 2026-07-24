import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Tab,
  Tabs,
  useToggle,
} from '@openedx/paragon';
import { SchoolOutline, Tag } from '@openedx/paragon/icons';

import { useCourseUserPermissions } from '@src/authz/hooks';
import * as permissionHelpers from '@src/authz/permissionHelpers';
import { ContentTagsDrawerSheet, ContentTagsSnippet } from '@src/content-tags-drawer';
import { useCourseSettings } from '@src/data/apiHooks';
import { ComponentCountSnippet } from '@src/generic/block-type-utils';
import { HelpSidebarLink, otherLinkURLParams, messages as helpSidebarMessages } from '@src/generic/help-sidebar';
import { SidebarContent, SidebarSection, SidebarTitle } from '@src/generic/sidebar';
import { useGetBlockTypes } from '@src/search-manager';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';

import { useCourseDetails } from '@src/course-outline/data/apiHooks';
import messages from '../messages';
import { useOutlineSidebarContext } from '../OutlineSidebarContext';
import { useEffect } from 'react';

const DetailsTab = () => {
  const intl = useIntl();

  const { courseId } = useCourseAuthoringContext();
  const { data: componentData } = useGetBlockTypes(
    [`context_key = "${courseId}"`],
  );
  const [isManageTagsDrawerOpen, openManageTagsDrawer, closeManageTagsDrawer] = useToggle(false);

  return (
    <>
      <SidebarContent>
        <SidebarSection
          title={intl.formatMessage(messages.sidebarSectionSummary)}
          icon={SchoolOutline}
        >
          {componentData && <ComponentCountSnippet componentData={componentData} />}
        </SidebarSection>
        <SidebarSection
          title={intl.formatMessage(messages.sidebarSectionTaxonomy)}
          icon={Tag}
          actions={[
            {
              label: intl.formatMessage(messages.sidebarSectionTaxonomyManageTags),
              onClick: openManageTagsDrawer,
            },
          ]}
        >
          <ContentTagsSnippet contentId={courseId} />
        </SidebarSection>
      </SidebarContent>
      <ContentTagsDrawerSheet
        id={courseId}
        onClose={closeManageTagsDrawer}
        showSheet={isManageTagsDrawerOpen}
      />
    </>
  );
};

const SettingsTab = () => {
  const intl = useIntl();
  const { courseId } = useCourseAuthoringContext();
  const { data: courseSettingsData } = useCourseSettings(courseId);

  const {
    grading,
    courseTeam,
    advancedSettings,
    scheduleAndDetails,
    groupConfigurations,
  } = otherLinkURLParams;
  const proctoredExamSettingsUrl = courseSettingsData?.mfeProctoredExamSettingsUrl;

  /*
    AuthZ for Course Authoring
    If authz.enable_course_authoring flag is enabled, validate permissions using AuthZ API.
  */
  const {
    isAuthzEnabled,
    canViewScheduleAndDetails,
    canViewGradingSettings,
    canViewCourseTeam,
    canManageGroupConfigurations,
    canManageAdvancedSettings,
  } = useCourseUserPermissions(courseId, {
    ...permissionHelpers.getScheduleAndDetailsPermissions(courseId),
    ...permissionHelpers.getGradingPermissions(courseId),
    ...permissionHelpers.getCourseTeamPermissions(courseId),
    ...permissionHelpers.getGroupConfigurationsPermissions(courseId),
    ...permissionHelpers.getAdvancedSettingsPermissions(courseId),
  });

  return (
    <SidebarSection
      title={intl.formatMessage(messages.settingsTabText)}
    >
      {canViewScheduleAndDetails && (
        <HelpSidebarLink
          as="span"
          pathToPage={`/course/${courseId}/${scheduleAndDetails}`}
          title={intl.formatMessage(
            helpSidebarMessages.sidebarLinkToScheduleAndDetails,
          )}
          isNewPage
        />
      )}
      {canViewGradingSettings && (
        <HelpSidebarLink
          as="span"
          pathToPage={`/course/${courseId}/${grading}`}
          title={intl.formatMessage(helpSidebarMessages.sidebarLinkToGrading)}
          isNewPage
        />
      )}
      {canViewCourseTeam && (
        isAuthzEnabled ?
          (
            <HelpSidebarLink
              as="span"
              pathToPage={`${getConfig().ADMIN_CONSOLE_URL}/authz?scope=${encodeURIComponent(courseId)}`}
              title={intl.formatMessage(helpSidebarMessages.sidebarLinkToRolesAndPermissions)}
              isNewPage={false}
            />
          ) :
          (
            <HelpSidebarLink
              as="span"
              pathToPage={`/course/${courseId}/${courseTeam}`}
              title={intl.formatMessage(helpSidebarMessages.sidebarLinkToCourseTeam)}
              isNewPage
            />
          )
      )}
      {canManageGroupConfigurations && (
        <HelpSidebarLink
          as="span"
          pathToPage={`/course/${courseId}/${groupConfigurations}`}
          title={intl.formatMessage(helpSidebarMessages.sidebarLinkToGroupConfigurations)}
          isNewPage
        />
      )}
      {canManageAdvancedSettings && (
        <HelpSidebarLink
          as="span"
          pathToPage={`/course/${courseId}/${advancedSettings}`}
          title={intl.formatMessage(helpSidebarMessages.sidebarLinkToAdvancedSettings)}
          isNewPage
        />
      )}
      {proctoredExamSettingsUrl && (
        <HelpSidebarLink
          as="span"
          pathToPage={proctoredExamSettingsUrl}
          title={intl.formatMessage(
            helpSidebarMessages.sidebarLinkToProctoredExamSettings,
          )}
          isNewPage
        />
      )}
    </SidebarSection>
  );
};

export const CourseInfoSidebar = () => {
  const intl = useIntl();
  const { courseId } = useCourseAuthoringContext();
  const { data: courseDetails } = useCourseDetails(courseId);
  const { currentTabKey, setCurrentTabKey } = useOutlineSidebarContext();

  useEffect(() => {
    if (!currentTabKey) {
      // Set default Tab key
      setCurrentTabKey('info');
    }
  }, [currentTabKey, setCurrentTabKey]);

  return (
    <>
      <SidebarTitle
        title={courseDetails?.title || ''}
        icon={SchoolOutline}
      />
      <Tabs
        variant="tabs"
        className="my-2 mx-n3.5"
        id="course-info-tabs"
        mountOnEnter
        activeKey={currentTabKey}
        onSelect={setCurrentTabKey}
      >
        <Tab eventKey="info" title={intl.formatMessage(messages.infoTabText)}>
          <DetailsTab />
        </Tab>
        <Tab eventKey="settings" title={intl.formatMessage(messages.settingsTabText)}>
          <SettingsTab />
        </Tab>
      </Tabs>
    </>
  );
};
