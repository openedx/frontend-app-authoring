import { useIntl } from '@edx/frontend-platform/i18n';
import { Container, Icon, Stack } from '@openedx/paragon';
import { ArrowDownward } from '@openedx/paragon/icons';
import classNames from 'classnames';
import { getItemIcon } from '@src/generic/block-type-utils';
import Loading from '@src/generic/Loading';
import NotFoundAlert from '@src/generic/NotFoundAlert';
import { ContainerType } from '@src/generic/key-utils';
import { useContainerHierarchy } from '../data/apiHooks';
import { useSidebarContext } from '../common/context/SidebarContext';
import messages from './messages';

const ContainerHierarchyRow = ({
  containerType,
  text,
  selected,
}: {
  containerType: ContainerType,
  text: string,
  selected: boolean,
}) => (
  <Stack>
    <Container
      className={classNames('p-0 m-0 hierarchy-row', { selected })}
    >
      <Stack
        direction="horizontal"
        gap={2}
        className="m-0 p-0"
      >
        <div className="p-2 icon">
          <Icon
            src={getItemIcon(containerType)}
            screenReaderText={containerType}
            title={containerType}
          />
        </div>
        <div className="p-2 text text-truncate">
          {text}
        </div>
      </Stack>
    </Container>
    <div
      className={classNames('hierarchy-arrow', { selected })}
    >
      <Icon
        src={ArrowDownward}
        screenReaderText={' '}
      />
    </div>
  </Stack>
);

const ContainerHierarchy = () => {
  const intl = useIntl();
  const { sidebarItemInfo } = useSidebarContext();
  const containerId = sidebarItemInfo?.id;

  // istanbul ignore if: this should never happen
  if (!containerId) {
    throw new Error('containerId is required');
  }

  const {
    data,
    isLoading,
    isError,
  } = useContainerHierarchy(containerId);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <NotFoundAlert />;
  }

  const {
    sections,
    subsections,
    units,
    components,
  } = data;

  return (
    <Stack>
      {sections && sections.length > 0 && (
        <ContainerHierarchyRow
          containerType={ContainerType.Section}
          text={intl.formatMessage(
            messages.hierarchySections,
            {
              displayName: sections[0].displayName,
              count: sections.length,
            },
          )}
          selected={
            sections[0].id === containerId
          }
        />
      )}
      {subsections && subsections.length > 0 && (
        <ContainerHierarchyRow
          containerType={ContainerType.Subsection}
          text={intl.formatMessage(
            messages.hierarchySubsections,
            {
              displayName: subsections[0].displayName,
              count: subsections.length,
            },
          )}
          selected={
            subsections[0].id === containerId
          }
        />
      )}
      {units && units.length > 0 && (
        <ContainerHierarchyRow
          containerType={ContainerType.Unit}
          text={intl.formatMessage(
            messages.hierarchyUnits,
            {
              displayName: units[0].displayName,
              count: units.length,
            },
          )}
          selected={
            units[0].id === containerId
          }
        />
      )}
      {components && components.length > 0 && (
        <ContainerHierarchyRow
          containerType={ContainerType.Components}
          text={intl.formatMessage(
            messages.hierarchyComponents,
            {
              displayName: components[0].displayName,
              count: components.length,
            },
          )}
          selected={
            components[0].id === containerId
          }
        />
      )}
    </Stack>
  );
};

export default ContainerHierarchy;
