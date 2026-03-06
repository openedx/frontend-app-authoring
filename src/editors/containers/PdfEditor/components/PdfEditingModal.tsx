import React, {PropsWithChildren, useContext, useEffect} from "react";
import {PdfBlockContext} from "@src/editors/containers/PdfEditor/contexts";
import {Formik, useFormikContext} from "formik";
import {Col, Row} from "@openedx/paragon";
import EditorContainer from "@src/editors/containers/EditorContainer";
import TextField from "@src/editors/containers/PdfEditor/components/TextField";
import {EditorComponent} from "@src/editors/EditorComponent";
import {PdfState} from "@src/editors/data/redux/pdf";

const PdfFormWrapper: React.FC<PropsWithChildren> = ({children}) => {
  const {values} = useFormikContext<PdfState>()
  const {state, setState} = useContext(PdfBlockContext)
  useEffect(() => {
    setState({...state, ...values})
  }, [values])
  return <>{children}</>
}

const PdfEditingModal: React.FC<EditorComponent> = (props: EditorComponent) => {
  const context = useContext(PdfBlockContext)
  useEffect(() => {
    context.setState({...context.state, sourceText: "Boop"})
  }, []);
  const getContent = () => {
    const settings = {...context.state}
    // Not a setting we control, but a backend flag. Have to remove it or the
    // backend will reject.
    console.log("settings are:", settings)
    delete settings["disableAllDownload"]
    return settings
  }
  return (
    <EditorContainer {...props} isDirty={() => true} getContent={getContent}>
      <Row>
        <Col xs={12}>
          <Formik initialValues={context.state} onSubmit={() => undefined}>
            <PdfFormWrapper>
              <TextField
                label="Display Name"
                id="pdf-display-name"
                hint={"The display name for your PDF Block."}
                fieldConfig="displayName"
              />
              <TextField
                label="Source Text"
                id="pdf-source-text"
                hint="Add a source description for this text"
                fieldConfig="sourceText"
              />
            </PdfFormWrapper>
          </Formik>
        </Col>
      </Row>
    </EditorContainer>
  )
}

export default PdfEditingModal
