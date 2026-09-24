/**
 * Typed views of components whose own types do not match what they accept.
 *
 * Host components that are still JavaScript: TypeScript infers their props from
 * the destructured parameters and marks them all required, ignoring
 * `defaultProps`. The declarations below restate each component's real contract,
 * taken from its `propTypes`. Delete an entry once the host converts that
 * component to TypeScript.
 *
 * Paragon components: two places where the published types are narrower than
 * the runtime (noted on each).
 */
import type React from 'react';
import { Alert, IconButton } from '@openedx/paragon';

import HostButton from 'CourseAuthoring/editors/sharedComponents/Button';
import HostSettingsOption from 'CourseAuthoring/editors/containers/ProblemEditor/components/EditProblemView/SettingsWidget/SettingsOption';
import HostDraggableList from 'CourseAuthoring/generic/DraggableList';

// Button spreads unknown props onto Paragon's Button, hence the index signature.
type ButtonProps = {
  variant?: string;
  className?: string | null;
  text?: string | null;
  children?: React.ReactNode;
  [prop: string]: unknown;
};

// SettingsOption likewise passes unknown props through to its Collapsible.
type SettingsOptionProps = {
  title: string;
  summary: string;
  className?: string;
  children: React.ReactNode;
  extraSections?: { children?: React.ReactNode; }[];
  hasExpandableTextArea?: boolean;
  [prop: string]: unknown;
};

type DraggableListProps<T> = {
  itemList: T[];
  setState: React.Dispatch<React.SetStateAction<T[]>>;
  updateOrder: () => (list: T[]) => void;
  children: React.ReactNode;
  renderOverlay?: (activeId: string | null) => React.ReactNode;
  activeId?: string | null;
  setActiveId?: (id: string | null) => void;
};

export const Button = HostButton as unknown as React.FC<ButtonProps>;
export const SettingsOption = HostSettingsOption as unknown as React.FC<SettingsOptionProps>;
export const DraggableList = HostDraggableList as unknown as <T extends { id: string; }>(
  props: DraggableListProps<T>,
) => React.ReactElement;
export { SortableItem } from 'CourseAuthoring/generic/DraggableList';

// Paragon's AlertHeadingProps omits `className`, but the component hands every
// prop on to react-bootstrap's Alert.Heading, which applies it. Widening the
// props is sound, so this needs no cast.
export const AlertHeading: React.FC<React.ComponentProps<typeof Alert.Heading> & { className?: string; }> =
  Alert.Heading;

// IconButton builds its class from any variant string (`btn-icon-${variant}`);
// its types list only the themed ones. `plain` is the unthemed button.
export const PlainIconButton = IconButton as unknown as React.FC<
  Omit<React.ComponentProps<typeof IconButton>, 'variant'> & { variant: 'plain'; }
>;
