import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Button, Spinner } from '@openedx/paragon';
import { EditorComponent } from '@src/editors/EditorComponent';
import EditorContainer from '@src/editors/containers/EditorContainer';
import { FieldArray, useFormikContext } from 'formik';
import { isEqual } from 'lodash';
import { PropsWithChildren, useContext, useEffect, useRef } from 'react';
import { FlashcardsEditorContext } from '@src/editors/containers/FlashcardsEditor/context';
import messages from '@src/editors/containers/FlashcardsEditor/messages';
import { emptyCard, FlashcardsState } from '@src/editors/containers/FlashcardsEditor/types';
import { Plus } from '@openedx/paragon/icons';
import DraggableList from '@src/generic/DraggableList';
import FlashcardsCard from './FlashcardsCard';
import SettingsSidebar from './SettingsSidebar';

const EditorWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const intl = useIntl();
  const { isPending, fetchError } = useContext(FlashcardsEditorContext);
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

export const FlashcardsEditorComponent: React.FC<EditorComponent> = (props) => {
  const intl = useIntl();
  const { fields } = useContext(FlashcardsEditorContext);
  const originalState = useRef({ ...fields });
  const { values, setValues, setFieldValue } = useFormikContext<FlashcardsState>();

  useEffect(() => {
    // Form is initialized before we get these values, so we have to set them
    // when they arrive.
    void setValues(fields); // eslint-disable-line no-void
  }, [fields]);

  const isDirty = () => isEqual(originalState, values);

  const getContent = () => {
    return {
      ...values,
      // filter out empty cards
      cards: values.cards.filter(card =>
        card.front.text || card.front.image.url || card.back.text || card.back.image.url
      ),
    };
  };

  return (
    <EditorContainer {...props} isDirty={isDirty} getContent={getContent}>
      <EditorWrapper>
        <div className="h-100 overflow-auto">
          <div className="d-flex w-100 p-2">
            <div className="flex-grow-1 mr-3">
              <h4>
                {intl.formatMessage(messages.descriptionHeaderFlashcard)}
              </h4>
              <FieldArray name="cards">
                {(arrayHelpers) => (
                  <>
                    <DraggableList
                      itemList={values.cards.map((card) => ({ id: card.key, ...card }))}
                      setState={() => {/* unused; persisted in updateOrder instead */}}
                      updateOrder={() => (cards) => setFieldValue('cards', cards)}
                    >
                      {values.cards.map((card, index) => (
                        <FlashcardsCard
                          key={card.key}
                          index={index}
                          onDelete={() => arrayHelpers.remove(index)}
                          onMoveUp={index > 0 ? () => arrayHelpers.swap(index - 1, index) : null}
                          onMoveDown={values.cards.length > index + 1
                            ? () => arrayHelpers.swap(index, index + 1)
                            : null}
                        />
                      ))}
                    </DraggableList>
                    <Button
                      className="text-primary-500"
                      onClick={() => arrayHelpers.push(emptyCard())}
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
