import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Card, Stack,
} from '@openedx/paragon';

import { NoComponents, NoSearchResults } from './EmptyStates';
import LibraryCollections from './LibraryCollections';
import LibraryComponents from './components/LibraryComponents';
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
      <Section title={intl.formatMessage(messages.componentsTitle, { componentCount })}>
        <LibraryComponents libraryId={libraryId} filter={filter} />
      </Section>
    </Stack>
  );
};

export default LibraryHome;
