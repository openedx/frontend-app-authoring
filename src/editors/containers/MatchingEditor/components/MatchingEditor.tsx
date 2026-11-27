import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Button, Spinner } from '@openedx/paragon';
import { EditorComponent } from '@src/editors/EditorComponent';
import EditorContainer from '@src/editors/containers/EditorContainer';
import { FieldArray, useFormikContext } from 'formik';
import { isEqual } from 'lodash';
import { PropsWithChildren, useContext, useEffect, useRef } from 'react';
import { MatchingEditorContext } from '@src/editors/containers/MatchingEditor/context';
import messages from '@src/editors/containers/MatchingEditor/messages';
import { emptyPair, MatchingState } from '@src/editors/containers/MatchingEditor/types';
import { Plus } from '@openedx/paragon/icons';
import DraggableList from '@src/generic/DraggableList';
import MatchingPair from './MatchingPair';
import SettingsSidebar from './SettingsSidebar';

const EditorWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const intl = useIntl();
  const { isPending, fetchError } = useContext(MatchingEditorContext);
  if (fetchError) {
    return (
      <div className="text-center p-6">
        <FormattedMessage {...messages.loadErrorHeading} />
      </div>
    );
  }
  if (isPending) {
    return (
      <div className="text-center p-6">
        <Spinner
          animation="border"
          className="m-3"
          screenReaderText={intl.formatMessage(messages.loadingSpinner)}
        />
      </div>
    );
  }
  return <>{children}</>; /* eslint-disable-line react/jsx-no-useless-fragment */
};

export const MatchingEditorComponent: React.FC<EditorComponent> = (props) => {
  const intl = useIntl();
  const { fields } = useContext(MatchingEditorContext);
  const originalState = useRef({ ...fields });
  const { values, setValues, setFieldValue } = useFormikContext<MatchingState>();

  useEffect(() => {
    // Form is initialized before we get these values, so we have to set them
    // when they arrive.
    void setValues(fields); // eslint-disable-line no-void
  }, [fields]);

  const isDirty = () => isEqual(originalState, values);

  const getContent = () => {
    return {
      ...values,
      // filter out empty pairs
      pairs: values.pairs.filter(pair => pair.left.text || pair.right.text),
    };
  };

  return (
    <EditorContainer {...props} isDirty={isDirty} getContent={getContent}>
      <EditorWrapper>
        <div className="h-100 overflow-auto">
          <div className="d-flex w-100 p-2">
            <div className="flex-grow-1 mr-3">
              <h4>
                {intl.formatMessage(messages.descriptionHeaderMatching)}
              </h4>
              <FieldArray name="pairs">
                {(arrayHelpers) => (
                  <>
                    <DraggableList
                      itemList={values.pairs.map((pair) => ({ id: pair.key, ...pair }))}
                      setState={() => {/* unused; persisted in updateOrder instead */}}
                      updateOrder={() => (pairs) => setFieldValue('pairs', pairs)}
                    >
                      {values.pairs.map((pair, index) => (
                        <MatchingPair
                          key={pair.key}
                          index={index}
                          onDelete={() => arrayHelpers.remove(index)}
                          onMoveUp={index > 0 ? () => arrayHelpers.swap(index - 1, index) : null}
                          onMoveDown={values.pairs.length > index + 1
                            ? () => arrayHelpers.swap(index, index + 1)
                            : null}
                        />
                      ))}
                    </DraggableList>
                    <Button
                      className="text-primary-500"
                      onClick={() => arrayHelpers.push(emptyPair())}
                      iconBefore={Plus}
                      variant="link"
                    >
                      {intl.formatMessage(messages.addLabel)}
                    </Button>
                  </>
                )}
              </FieldArray>
            </div>
            <SettingsSidebar />
          </div>
        </div>
      </EditorWrapper>
    </EditorContainer>
  );
};
