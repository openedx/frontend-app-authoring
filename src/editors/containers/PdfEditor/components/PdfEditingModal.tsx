import {useContext} from "react";
import {PdfBlockContext} from "@src/editors/containers/PdfEditor/contexts";
import {Formik, useField} from "formik";
import {Col, Row} from "@openedx/paragon";

const PdfEditingModal = () => {
  const context = useContext(PdfBlockContext)
  const displayName = useField("displayName", )
  return (
    <Row>
      <Col xs={12}>

      </Col>
    </Row>
  )
}

export default PdfEditingModal
