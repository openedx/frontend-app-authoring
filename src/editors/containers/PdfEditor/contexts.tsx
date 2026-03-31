import React, {
  createContext, useEffect, useMemo, useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectors } from '@src/editors/data/redux';
import { useBlockHandlerData } from './api';

export interface PdfState {
  displayName: string,
  url: string,
  allowDownload: boolean,
  sourceText: string,
  sourceUrl: string,
  // Note: Not a field, so can't be set.
  disableAllDownload: boolean,
}

declare interface PdfBlockContextInterface {
  fields: PdfState,
  fetchError: Error | null,
  isPending: boolean,
  blockId: string,
  isLibrary: boolean,
}

export const initialPdfState: () => PdfState = () => ({
  displayName: 'pdf',
  url: '',
  allowDownload: true,
  sourceText: '',
  sourceUrl: '',
  disableAllDownload: false,
});

export const PdfBlockContext = createContext<PdfBlockContextInterface>({
  fields: initialPdfState(),
  fetchError: null,
  isPending: true,
  blockId: '',
  isLibrary: false,
});

export const PdfBlockContextProvider: React.FC<{ blockId: string, children: React.ReactNode }> = (
  { blockId, children },
) => {
  const [uniqueId] = useState(() => uuidv4());
  const defaultData = useMemo(initialPdfState, []);
  const { data, error, isPending } = useBlockHandlerData<PdfState>({
    blockId, uniqueId, handlerName: 'load_pdf', defaultData,
  });
  const isLibrary = useSelector(selectors.app.isLibrary);

  const queryClient = useQueryClient();
  // Drop state on unmount so that when we open again we have revised state.
  useEffect(() => () => {
    // We use a unique ID because a component higher up in the chain remounts quickly on
    // startup, and cancelling or invalidating that transaction immediately results in
    // the query key being recreated immediately, and then being populated with the result
    // of being canceled.
    //
    // If we've encountered this block before, invalidating will result in the user seeing
    // the form with stale data before it's refetched, should we have encountered this block
    // before. Additionally, the stale flag won't get properly cleared due to the race
    // conditions for the remount.
    //
    // We can't invalidate on mutation because the rest of the saving code still relies on
    // thunks. That means the code that would invalidate this is squirreled away somewhere
    // arcane where we can't pull the QueryClient from the context hook.
    //
    // Forcing a unique ID appears to be the most practical workaround.
    const queryKey = ['blockHandlerData', blockId, uniqueId, 'load_pdf'];
    queryClient.removeQueries({ queryKey });
  }, []);

  const value = useMemo(() => ({
    fields: data || defaultData,
    fetchError: error,
    isPending,
    blockId,
    isLibrary,
  }), [data, error, isPending]);

  return (
    <PdfBlockContext.Provider value={value}>{children}</PdfBlockContext.Provider>
  );
};
