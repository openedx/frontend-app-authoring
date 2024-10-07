/* eslint-disable no-nested-ternary */
/* eslint-disable import/prefer-default-export */
import React from 'react';
import {
  Alert,
  Button,
  Collapsible,
  OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';
import { FormattedMessage, FormattedNumber, useIntl } from '@edx/frontend-platform/i18n';

import { LoadingSpinner } from '../../generic/Loading';
import { CodeEditor, EditorAccessor } from '../../generic/CodeEditor';
import { useLibraryContext } from '../common/context';
import {
  useContentLibrary,
  useUpdateXBlockOLX,
  useXBlockAssets,
  useXBlockOLX,
} from '../data/apiHooks';
import messages from './messages';

interface Props {
  usageKey: string;
}

export const ComponentAdvancedInfo: React.FC<Props> = ({ usageKey }) => {
  const intl = useIntl();
  const { libraryId } = useLibraryContext();
  const { data: library } = useContentLibrary(libraryId);
  const canEditLibrary = library?.canEditLibrary ?? false;
  const { data: olx, isLoading: isOLXLoading } = useXBlockOLX(usageKey);
  const { data: assets, isLoading: areAssetsLoading } = useXBlockAssets(usageKey);
  const editorRef = React.useRef<EditorAccessor | undefined>(undefined);
  const [isEditingOLX, setEditingOLX] = React.useState(false);
  const olxUpdater = useUpdateXBlockOLX(usageKey);
  const updateOlx = React.useCallback(() => {
    const newOLX = editorRef.current?.state.doc.toString();
    if (!newOLX) {
      /* istanbul ignore next */
      throw new Error('Unable to get OLX string from codemirror.'); // Shouldn't happen.
    }
    olxUpdater.mutateAsync(newOLX).then(() => {
      // Only if we succeeded:
      setEditingOLX(false);
    }).catch(() => {
      // On error, an <Alert> is shown below. We catch here to avoid the error propagating up.
    });
  }, [editorRef, olxUpdater, intl]);
  return (
    <Collapsible
      styling="basic"
      title={intl.formatMessage(messages.advancedDetailsTitle)}
    >
      <dl>
        <h3 className="h5"><FormattedMessage {...messages.advancedDetailsUsageKey} /></h3>
        <p className="text-monospace small">{usageKey}</p>
        <h3 className="h5"><FormattedMessage {...messages.advancedDetailsOLX} /></h3>
        {(() => {
          if (isOLXLoading) { return <LoadingSpinner />; }
          if (!olx) { return <FormattedMessage {...messages.advancedDetailsOLXError} />; }
          return (
            <div className="mb-4">
              {olxUpdater.error && (
                <Alert variant="danger">
                  <p><strong><FormattedMessage {...messages.advancedDetailsOLXEditFailed} /></strong></p>
                  {/*
                    TODO: fix the API so it returns 400 errors in a JSON object, not HTML 500 errors. Then display
                    a useful error message here like "parsing the XML failed on line 3".
                    (olxUpdater.error as Record<string, any>)?.customAttributes?.httpErrorResponseData.errorMessage
                  */}
                </Alert>
              )}
              <CodeEditor key={usageKey} readOnly={!isEditingOLX} editorRef={editorRef}>{olx}</CodeEditor>
              {
                isEditingOLX ? (
                  <>
                    <Button variant="primary" onClick={updateOlx} disabled={olxUpdater.isLoading}>
                      <FormattedMessage {...messages.advancedDetailsOLXSaveButton} />
                    </Button>
                    <Button variant="link" onClick={() => setEditingOLX(false)} disabled={olxUpdater.isLoading}>
                      <FormattedMessage {...messages.advancedDetailsOLXCancelButton} />
                    </Button>
                  </>
                ) : canEditLibrary ? (
                  <OverlayTrigger
                    placement="bottom-start"
                    overlay={(
                      <Tooltip id="olx-edit-button">
                        <FormattedMessage {...messages.advancedDetailsOLXEditWarning} />
                      </Tooltip>
                    )}
                  >
                    <Button variant="link" onClick={() => setEditingOLX(true)}>
                      <FormattedMessage {...messages.advancedDetailsOLXEditButton} />
                    </Button>
                  </OverlayTrigger>
                ) : (
                  null
                )
              }
            </div>
          );
        })()}
        <h3 className="h5"><FormattedMessage {...messages.advancedDetailsAssets} /></h3>
        <ul>
          { areAssetsLoading ? <li><LoadingSpinner /></li> : null }
          { assets?.map(a => (
            <li key={a.path}>
              <a href={a.url}>{a.path}</a>{' '}
              (<FormattedNumber value={a.size} notation="compact" unit="byte" unitDisplay="narrow" />)
            </li>
          )) }
        </ul>
      </dl>
    </Collapsible>
  );
};
