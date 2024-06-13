// @ts-check
/* eslint-disable react/prop-types */
import React from 'react';

import { TextFields } from '@openedx/paragon/icons';
import { CardGrid } from '@openedx/paragon';
import { NoComponents, NoSearchResults } from '../EmptyStates';
import { useLibraryComponentCount } from '../data/apiHook';
import ComponentsCard from './ComponentCard';

/**
 * @type {React.FC<{
 *   libraryId: string,
 *   filter: {
 *     searchKeywords: string,
 *   },
 * }>}
 */
const LibraryComponents = ({ libraryId, filter: { searchKeywords } }) => {
  const { componentCount } = useLibraryComponentCount(libraryId, searchKeywords);

  if (componentCount === 0) {
    return searchKeywords === '' ? <NoComponents /> : <NoSearchResults />;
  }

  return (
    <CardGrid
      columnSizes={{
        sm: 12,
        md: 5,
        lg: 4,
        xl: 3,
      }}
    >
      <ComponentsCard icon={TextFields} tagCount={10} blockType="html" />
      <ComponentsCard icon={TextFields} tagCount={10} blockType="html" />
      <ComponentsCard icon={TextFields} tagCount={10} blockType="html" />
      <ComponentsCard icon={TextFields} tagCount={10} blockType="html" />
      <ComponentsCard icon={TextFields} tagCount={10} blockType="html" />
      <ComponentsCard icon={TextFields} tagCount={10} blockType="html" />
      <ComponentsCard icon={TextFields} tagCount={10} blockType="html" />
      <ComponentsCard icon={TextFields} tagCount={10} blockType="html" />
      <ComponentsCard icon={TextFields} tagCount={10} blockType="html" />
      <ComponentsCard icon={TextFields} tagCount={10} blockType="html" />
      <ComponentsCard icon={TextFields} tagCount={10} blockType="html" />
      <ComponentsCard icon={TextFields} tagCount={10} blockType="html" />
      <ComponentsCard icon={TextFields} tagCount={10} blockType="html" />
      <ComponentsCard icon={TextFields} tagCount={10} blockType="html" />
    </CardGrid>
  );
};

export default LibraryComponents;
