import type { ReactNode } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Link } from 'react-router-dom';
import {
  Breadcrumb, MenuItem, SelectMenu,
} from '@openedx/paragon';
import { ContainerType } from '@src/generic/key-utils';
import type { ContentLibrary } from '../../data/api';
import messages from './messages';

interface OverflowLinksProps {
  to: string | string[];
  children: ReactNode | ReactNode[];
  containerType: ContainerType;
}

const OverflowLinks = ({ children, to, containerType }: OverflowLinksProps) => {
  const intl = useIntl();

  if (typeof to === 'string') {
    return (
      <Link className="parents-breadcrumb link-muted" to={to}>
        {children}
      </Link>
    );
  }

  // istanbul ignore if: this should never happen
  if (!Array.isArray(to) || !Array.isArray(children) || to.length !== children.length) {
    throw new Error('Both "to" and "children" should have the same length.');
  }

  // to is string[] that should be converted to overflow menu
  const items = to.map((link, index) => (
    <MenuItem key={link} to={link} as={Link}>
      {children[index]}
    </MenuItem>
  ));

  const containerTypeName = containerType === ContainerType.Unit
    ? intl.formatMessage(messages.breadcrumbsSubsectionsDropdown)
    : intl.formatMessage(messages.breadcrumbsSectionsDropdown);

  return (
    <SelectMenu
      className="breadcrumb-menu"
      variant="link"
      defaultMessage={`${items.length} ${containerTypeName}`}
    >
      {items}
    </SelectMenu>
  );
};

export interface ContainerParents {
  displayName?: string[];
  key?: string[];
}

type ContentLibraryPartial = Pick<ContentLibrary, 'id' | 'title'> & Partial<ContentLibrary>;

interface ParentBreadcrumbsProps {
  libraryData: ContentLibraryPartial;
  parents?: ContainerParents;
  containerType: ContainerType;
}

export const ParentBreadcrumbs = ({ libraryData, parents, containerType }: ParentBreadcrumbsProps) => {
  const intl = useIntl();
  const { id: libraryId, title: libraryTitle } = libraryData;

  const links: Array<{ label: string | string[], to: string | string[], containerType: ContainerType }> = [
    {
      label: libraryTitle,
      to: `/library/${libraryId}`,
      containerType,
    },
  ];

  const parentLength = parents?.key?.length || 0;
  const parentNameLength = parents?.displayName?.length || 0;

  if (parentLength !== parentNameLength) {
    throw new Error('Parents key and displayName arrays must have the same length.');
  }

  const parentType = containerType === ContainerType.Unit
    ? 'subsection'
    : 'section';

  if (parentLength === 0 || !parents) {
    // Adding empty breadcrumb to add the last `>` spacer.
    links.push({
      label: '',
      to: '',
      containerType,
    });
  } else if (parentLength === 1) {
    links.push({
      label: parents.displayName?.[0] || '',
      to: `/library/${libraryId}/${parentType}/${parents.key?.[0]}`,
      containerType,
    });
  } else {
    // Add all parents as a single object containing list of links
    // This is converted to overflow menu by OverflowLinks component
    links.push({
      label: parents.displayName || [],
      to: parents.key?.map((parentKey) => `/library/${libraryId}/${parentType}/${parentKey}`) || [],
      containerType,
    });
  }

  return (
    <Breadcrumb
      ariaLabel={intl.formatMessage(messages.breadcrumbsAriaLabel)}
      links={links}
      linkAs={OverflowLinks}
    />
  );
};
