// @ts-check
import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Card, Stack,
} from '@openedx/paragon';

import { NoComponents, NoSearchResults } from './EmptyStates';
import LibraryCollections from './LibraryCollections';
import LibraryComponents from './LibraryComponents';
import { useLibraryComponentCount } from './data/apiHook';
import messages from './messages';

const Section = ({ title, children } : { title: string, children: React.ReactNode }) => (
  <Card>
    <Card.Header
      title={title}
    />
    <Card.Section>
      {children}
    </Card.Section>
  </Card>
);

type LibraryHomeProps = {
  libraryId: string,
  filter: {
    searchKeywords: string,
  },
};

const LibraryHome = ({ libraryId, filter } : LibraryHomeProps) => {
  const { searchKeywords } = filter;
  const { componentCount, collectionCount } = useLibraryComponentCount(libraryId, searchKeywords);

  if (componentCount === 0) {
    return searchKeywords === '' ? <NoComponents /> : <NoSearchResults />;
  }

  return (
    <Stack gap={3}>
      <Section title="Recently Modified">
        <FormattedMessage {...messages.recentComponentsTempPlaceholder} />
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
