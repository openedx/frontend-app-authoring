import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { NoComponents, NoSearchResults } from './EmptyStates';
import { useLibraryComponentCount } from './data/apiHooks';
import messages from './messages';

type LibraryComponentsProps = {
  libraryId: string;
  filter: {
    searchKeywords: string;
  };
};

const LibraryComponents = ({ libraryId, filter: { searchKeywords } }: LibraryComponentsProps) => {
  const { componentCount } = useLibraryComponentCount(libraryId, searchKeywords);

  if (componentCount === 0) {
    return searchKeywords === '' ? <NoComponents /> : <NoSearchResults />;
  }

  return (
    <div className="d-flex my-6 justify-content-center">
      <FormattedMessage
        {...messages.componentsTempPlaceholder}
        values={{ componentCount }}
      />
    </div>
  );
};

export default LibraryComponents;
