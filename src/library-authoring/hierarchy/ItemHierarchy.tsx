import type { MessageDescriptor } from 'react-intl';
import classNames from 'classnames';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Container, Icon, Stack } from '@openedx/paragon';
import { ArrowDownward, Check, Description } from '@openedx/paragon/icons';

import { getItemIcon } from '@src/generic/block-type-utils';
import { ContainerType } from '@src/generic/key-utils';
import Loading from '@src/generic/Loading';

import type { ItemHierarchyMember } from '../data/api';
import messages from './messages';
import { useSidebarContext } from '../common/context/SidebarContext';
import { useLibraryItemHierarchy } from '../data/apiHooks';

const HierarchyRow = ({
  containerType,
  text,
  selected,
  showArrow,
  willPublish = false,
  publishMessage = undefined,
}: {
  containerType: ContainerType,
  text: string,
  selected: boolean,
  showArrow: boolean,
  willPublish?: boolean,
  publishMessage?: MessageDescriptor,
}) => (
  <Stack>
    <Container
      className={classNames('hierarchy-row', { selected })}
    >
      <Stack
        direction="horizontal"
        gap={2}
      >
        <div className="icon">
          <Icon
            src={getItemIcon(containerType)}
            screenReaderText={containerType}
            title={containerType}
          />
        </div>
        <div className="text text-truncate">
          {text}
        </div>
        {publishMessage && (
          <Stack
            direction="horizontal"
            gap={2}
            className="publish-status"
          >
            <Icon src={willPublish ? Check : Description} />
            <FormattedMessage {...(willPublish ? messages.willPublishChipText : publishMessage)} />
          </Stack>
        )}
      </Stack>
    </Container>
    {showArrow && (
      <div
        className={classNames('hierarchy-arrow', { selected })}
      >
        <Icon
          src={ArrowDownward}
          screenReaderText={' '}
        />
      </div>
    )}
  </Stack>
);

export const ItemHierarchy = ({
  showPublishStatus = false,
}: {
  showPublishStatus?: boolean,
}) => {
  const intl = useIntl();
  const { sidebarItemInfo } = useSidebarContext();
  const itemId = sidebarItemInfo?.id;

  // istanbul ignore if: this should never happen
  if (!itemId) {
    throw new Error('itemId is required');
  }

  const {
    data,
    isPending,
    isError,
  } = useLibraryItemHierarchy(itemId);

  if (isPending) {
    return <Loading />;
  }

  // istanbul ignore if: this should never happen
  if (isError) {
    return null;
  }

  const {
    sections,
    subsections,
    units,
    components,
  } = data;

  // Returns a message describing the publish status of the given hierarchy row.
  const publishMessage = (contents: ItemHierarchyMember[]) => {
    // If we're not showing publish status, then we don't need a publish message
    if (!showPublishStatus) {
      return undefined;
    }

    // If any item has unpublished changes, mark this row as Draft.
    if (contents.some((item) => item.hasUnpublishedChanges)) {
      return messages.draftChipText;
    }

    // Otherwise, it's Published
    return messages.publishedChipText;
  };

  // Returns True if any of the items in the list match the currently selected item.
  const selected = (contents: ItemHierarchyMember[]): boolean => (
    contents.some((item) => item.id === itemId)
  );

  // Use the "selected" status to determine the selected row.
  // If showPublishStatus, that row and its children will be marked "willPublish".
  const selectedSections = selected(sections);
  const selectedSubsections = selected(subsections);
  const selectedUnits = selected(units);
  const selectedComponents = selected(components);

  const showSections = sections && sections.length > 0;
  const showSubsections = subsections && subsections.length > 0;
  const showUnits = units && units.length > 0;
  const showComponents = components && components.length > 0;

  return (
    <Stack className="content-hierarchy">
      {showSections && (
        <HierarchyRow
          containerType={ContainerType.Section}
          text={intl.formatMessage(
            messages.hierarchySections,
            {
              displayName: sections[0].displayName,
              count: sections.length,
            },
          )}
          showArrow={showSubsections}
          selected={selectedSections}
          willPublish={selectedSections}
          publishMessage={publishMessage(sections)}
        />
      )}
      {showSubsections && (
        <HierarchyRow
          containerType={ContainerType.Subsection}
          text={intl.formatMessage(
            messages.hierarchySubsections,
            {
              displayName: subsections[0].displayName,
              count: subsections.length,
            },
          )}
          showArrow={showUnits}
          selected={selectedSubsections}
          willPublish={selectedSubsections || selectedSections}
          publishMessage={publishMessage(subsections)}
        />
      )}
      {showUnits && (
        <HierarchyRow
          containerType={ContainerType.Unit}
          text={intl.formatMessage(
            messages.hierarchyUnits,
            {
              displayName: units[0].displayName,
              count: units.length,
            },
          )}
          showArrow={showComponents}
          selected={selectedUnits}
          willPublish={selectedUnits || selectedSubsections || selectedSections}
          publishMessage={publishMessage(units)}
        />
      )}
      {showComponents && (
        <HierarchyRow
          containerType={ContainerType.Components}
          text={intl.formatMessage(
            messages.hierarchyComponents,
            {
              displayName: components[0].displayName,
              count: components.length,
            },
          )}
          showArrow={false}
          selected={selectedComponents}
          willPublish={selectedComponents || selectedUnits || selectedSubsections || selectedSections}
          publishMessage={publishMessage(components)}
        />
      )}
    </Stack>
  );
};
