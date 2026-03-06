import React, {createContext, useEffect, useState} from "react";
import {PdfState} from "@src/editors/data/redux/pdf";
import {initialPdfState} from "@src/editors/data/redux/pdf/reducers";
import { useBlockData } from "./api";

declare type PdfErrors = Record<keyof PdfState, string[]>
declare type FieldUpdater = <T, Property extends keyof T,>(key: Property, value: T[Property]) => void

declare interface PdfBlockContextInterface {
  state: PdfState,
  errors: PdfErrors,
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
  errors: initEmptyErrors(),
  setState: () => undefined,
  ready: false,
  fetchError: null,
})

export const PdfBlockContextProvider: React.FC<{blockId: string, children: React.ReactNode}> = ({blockId, children}) => {
  const {isPending, error, data, isSuccess} = useBlockData<PdfState>(blockId)
  console.log("data is", data)
  const [state, setState] = useState(initialPdfState())
  const [errors, setErrors] = useState(initEmptyErrors())

  useEffect(() => {
    if (!data) {
      return
    }
    setState(data)
  }, [data])
  console.log("Error is", error)

  return <PdfBlockContext.Provider value={{state, errors, setState, ready: isSuccess, fetchError: error}}>{children}</PdfBlockContext.Provider>
}
