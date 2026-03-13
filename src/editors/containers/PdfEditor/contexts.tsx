import React, {
  createContext, useEffect, useMemo, useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useQueryClient } from '@tanstack/react-query';
import { useBlockData } from './api';

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
});

export const PdfBlockContextProvider: React.FC<{ blockId: string, children: React.ReactNode }> = (
  { blockId, children },
) => {
  const [uniqueId] = useState(() => uuidv4());

  const { data, error, isPending } = useBlockData<PdfState>({ blockId, uniqueId, handlerName: 'load_pdf' });
  const defaultFields = useMemo(initialPdfState, []);

  const queryClient = useQueryClient();
  // Drop state on unmount so that when we open again we have revised state.
  useEffect(() => () => {
    // We use a unique ID because a component higher up in the chain remounts quickly on
    // startup, and cancelling or invalidating that transaction immediately results in
    // the query key being recreated immediately, and then being populated with the result
    // of being canceled.
    //
    // Invalidating will result in the user seeing the form with stale data before it's
    // refetched. Additionally, the stale flag won't get properly cleared due to the
    // race conditions for the remount.
    //
    // Forcing a unique ID appears to be the most practical workaround.
    const queryKey = ['blockData', blockId, uniqueId];
    queryClient.removeQueries({ queryKey });
  }, []);

  const value = useMemo(() => ({
    fields: data || defaultFields,
    fetchError: error,
    isPending,
  }), [data, error, isPending]);

  return (
    <PdfBlockContext.Provider value={value}>{children}</PdfBlockContext.Provider>
  );
};
