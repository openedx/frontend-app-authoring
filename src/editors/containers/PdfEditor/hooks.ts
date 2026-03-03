import {useContext} from "react";
import {PdfState} from "@src/editors/data/redux/pdf";
import {PdfBlockContext} from "@src/editors/containers/PdfEditor/contexts";

export const useField = <K extends keyof PdfState>(
  fieldName: K, fieldUpdater: (newValue: PdfState[K]) => any
) => {
  const context = useContext(PdfBlockContext)
  const value = context.settings[fieldName]
  const errors = context.settings[fieldName]
  return {
    onChange: (value: PdfState[K]) => fieldUpdater(value),
    value,
    errors,
  }
}

// export const fileInput = ({ fileSizeError }) => {
//   // eslint-disable-next-line react-hooks/rules-of-hooks
//   const dispatch = useDispatch();
//   // eslint-disable-next-line react-hooks/rules-of-hooks
//   const ref = React.useRef<HTMLElement>();
//   const click = () => {ref.current && ref.current.click()};
//   const addFile = (e) => {
//     const file = e.target.files[0];
//     if (file && checkValidFileSize({
//       file,
//       onSizeFail: () => {
//         fileSizeError.set();
//       },
//     })) {
//       dispatch(thunkActions.pdf.uploadAsset({
//         file,
//       }));
//     }
//   };
//   return {
//     click,
//     addFile,
//     ref,
//   };
// };
