import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Card, Stack,
} from '@openedx/paragon';

import { NoComponents, NoSearchResults } from './EmptyStates';
import LibraryCollections from './LibraryCollections';
import { useLibraryComponentCount } from './data/apiHooks';
import messages from './messages';
import { LibraryComponents } from './components';

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
  const intl = useIntl();
  const { searchKeywords } = filter;
  const { componentCount, collectionCount } = useLibraryComponentCount(libraryId, searchKeywords);

  if (componentCount === 0) {
    return searchKeywords === '' ? <NoComponents /> : <NoSearchResults />;
  }

  return (
    <Stack gap={3}>
      <Section title={intl.formatMessage(messages.recentlyModifiedTitle)}>
        { intl.formatMessage(messages.recentComponentsTempPlaceholder) }
      </Section>
      <Section title={intl.formatMessage(messages.collectionsTitle, { collectionCount })}>
        <LibraryCollections />
      </Section>
      <Section title={`Components (${componentCount})`}>
        <LibraryComponents libraryId={libraryId} filter={filter} variant="preview" />
      </Section>
    </Stack>
  );
};

export default LibraryHome;
