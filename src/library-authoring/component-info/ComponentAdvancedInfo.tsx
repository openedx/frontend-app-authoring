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
import { useUpdateXBlockOLX, useXBlockAssets, useXBlockOLX } from '../data/apiHooks';
import messages from './messages';

interface Props {
  usageKey: string;
}

export const ComponentAdvancedInfo: React.FC<Props> = ({ usageKey }) => {
  const intl = useIntl();
  // TODO: hide the "Edit" button if the library is read only
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
        <dt><FormattedMessage {...messages.advancedDetailsUsageKey} /></dt>
        <dd className="text-monospace small">{usageKey}</dd>
        <dt><FormattedMessage {...messages.advancedDetailsOLX} /></dt>
        <dd>{(() => {
          if (isOLXLoading) { return <LoadingSpinner />; }
          if (!olx) { return <FormattedMessage {...messages.advancedDetailsOLXError} />; }
          return (
            <>
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
              <CodeEditor readOnly={!isEditingOLX} editorRef={editorRef}>{olx}</CodeEditor>
              {
                isEditingOLX
                  ? (
                    <>
                      <Button variant="primary" onClick={updateOlx} disabled={olxUpdater.isLoading}>
                        <FormattedMessage {...messages.advancedDetailsOLXSaveButton} />
                      </Button>
                      <Button variant="link" onClick={() => setEditingOLX(false)} disabled={olxUpdater.isLoading}>
                        <FormattedMessage {...messages.advancedDetailsOLXCancelButton} />
                      </Button>
                    </>
                  )
                  : (
                    <OverlayTrigger
                      placement="bottom-start"
                      overlay={(
                        <Tooltip id="olx-edit-button">
                          <FormattedMessage {...messages.advancedDetailsOLXEditWarning} />
                        </Tooltip>
                      )}
                    >
                      <Button variant="link" onClick={() => setEditingOLX(true)}><FormattedMessage {...messages.advancedDetailsOLXEditButton} /></Button>
                    </OverlayTrigger>
                  )
                }
            </>
          );
        })()}
        </dd>
        <dt><FormattedMessage {...messages.advancedDetailsAssets} /></dt>
        <dd>
          <ul>
            { areAssetsLoading ? <li><LoadingSpinner /></li> : null }
            { assets?.map(a => (
              <li key={a.path}><a href={a.url}>{a.path}</a> (<FormattedNumber value={a.size} notation="compact" unit="byte" unitDisplay="narrow" />)</li>
            )) }
          </ul>
        </dd>
      </dl>
    </Collapsible>
  );
};
