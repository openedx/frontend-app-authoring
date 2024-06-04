// @ts-check
/* eslint-disable react/prop-types */
import React from 'react';
import {
  Card, Stack,
} from '@openedx/paragon';

import { NoComponents, NoSearchResults } from './EmptyStates';
import LibraryCollections from './LibraryCollections';
import LibraryComponents from './LibraryComponents';
import { useLibraryComponentCount } from './data/apiHook';

/**
 * @type {React.FC<{
 *   title: string,
 *   children: React.ReactNode,
 * }>}
 */
const Section = ({ title, children }) => (
  <Card>
    <Card.Header
      title={title}
    />
    <Card.Section>
      {children}
    </Card.Section>
  </Card>
);

/**
 * @type {React.FC<{
 *   libraryId: string,
 *   filter: {
 *     searchKeywords: string,
 *   },
 * }>}
 */
const LibraryHome = ({ libraryId, filter }) => {
  const { searchKeywords } = filter;
  const { componentCount, collectionCount } = useLibraryComponentCount(libraryId, searchKeywords);

  if (componentCount === 0) {
    return searchKeywords === '' ? <NoComponents /> : <NoSearchResults />;
  }

  return (
    <Stack gap={3}>
      <Section title="Recently Modified">
        Recently modified components and collections will be displayed here.
      </Section>
      <Section title={`Collections (${collectionCount})`}>
        <LibraryCollections />
      </Section>
      <Section title={`Components (${componentCount})`}>
        <LibraryComponents libraryId={libraryId} filter={filter} />
      </Section>
    </Stack>
  );
};

export default LibraryHome;