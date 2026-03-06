import React, {createContext, useEffect, useState} from "react";
import {PdfState} from "@src/editors/data/redux/pdf";
import {initialPdfState} from "@src/editors/data/redux/pdf/reducers";
import { useBlockData } from "./api";

declare type PdfErrors = Record<keyof PdfState, string[]>

declare interface PdfBlockContextInterface {
  state: PdfState,
  setState: (state: PdfState) => void,
  ready: boolean,
  fetchError: Error|null,
}

const mockState = initialPdfState()

export const initEmptyErrors = () => Object.fromEntries(Object.keys(mockState).map(
  (key: keyof PdfState) => [key, [] as string[]]
)) as PdfErrors

export const PdfBlockContext = createContext<PdfBlockContextInterface>({
  state: initialPdfState(),
  setState: () => undefined,
  ready: false,
  fetchError: null,
})

export const PdfBlockContextProvider: React.FC<{blockId: string, children: React.ReactNode}> = ({blockId, submit, children}) => {
  const {isPending, error, data, isSuccess} = useBlockData<PdfState>(blockId)
  console.log("data is", data)
  const [state, setState] = useState(initialPdfState())

  useEffect(() => {
    if (!data) {
      return
    }
    setState(data)
  }, [data])
  console.log("Error is", error)

  return <PdfBlockContext.Provider value={{state, setState, ready: isSuccess, fetchError: error}}>{children}</PdfBlockContext.Provider>
}
