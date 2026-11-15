import { v4 as uuidv4 } from 'uuid';
import { createContext, useEffect, useMemo, useState } from 'react';
import { useBlockHandlerData } from './api';
import { useSelector } from 'react-redux';
import { selectors } from '@src/editors/data/redux';
import { useQueryClient } from '@tanstack/react-query';
import { FlashcardsState, initialFlashcardsState } from './types';

interface FlashcardsEditorContextInterface {
  fields: FlashcardsState;
  fetchError: Error | null;
  isPending: boolean;
  blockId: string;
  isLibrary: boolean;
}

export const FlashcardsEditorContext = createContext<FlashcardsEditorContextInterface>({
  fields: initialFlashcardsState(),
  fetchError: null,
  isPending: true,
  blockId: '',
  isLibrary: false,
});

export const FlashcardsEditorContextProvider: React.FC<{ blockId: string; children: React.ReactNode; }> = (
  { blockId, children },
) => {
  const [uniqueId] = useState(() => uuidv4());
  const defaultData = useMemo(initialFlashcardsState, []);
  const { data, error, isPending } = useBlockHandlerData<FlashcardsState>({
    blockId,
    uniqueId,
    handlerName: 'load_flashcards',
    defaultData,
  });
  const isLibrary = useSelector(selectors.app.isLibrary);

  const queryClient = useQueryClient();
  // Drop state on unmount so that when we open again we have revised state.
  useEffect(() => () => {
    // We use a unique ID because a component higher up in the chain remounts quickly on
    // startup (possibly related to React strict mode),
    // and cancelling or invalidating that transaction immediately results in
    // the query key being recreated immediately, and then being populated with the result
    // of being canceled.
    const queryKey = ['blockHandlerData', blockId, uniqueId, 'load_flashcards'];
    queryClient.removeQueries({ queryKey });
  }, []);

  const value = useMemo(() => ({
    fields: data || defaultData,
    fetchError: error,
    isPending,
    blockId,
    isLibrary,
  }), [data, error, isPending]);

  return <FlashcardsEditorContext.Provider value={value}>{children}</FlashcardsEditorContext.Provider>;
};
