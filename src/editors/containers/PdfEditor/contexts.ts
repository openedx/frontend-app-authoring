import {createContext} from "react";
import {PdfState} from "@src/editors/data/redux/pdf";
import {initialPdfState} from "@src/editors/data/redux/pdf/reducers";

declare type PdfErrors = Record<keyof PdfState, string[]>

declare interface PdfBlockContextInterface {
  settings: PdfState,
  errors: PdfErrors,
}

export const initEmptyErrors = () => Object.fromEntries(Object.keys(initialPdfState()).map(
  (key: keyof PdfState) => [key, [] as string[]]
)) as PdfErrors

export const PdfBlockContext = createContext<PdfBlockContextInterface>({
  settings: initialPdfState(),
  errors: initEmptyErrors(),
})
