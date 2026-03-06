import {Col, Form} from "@openedx/paragon";
import {useField, FieldHookConfig, useFormikContext} from "formik";

declare interface TextFieldProps {
  label: string,
  id: string,
  type?: string,
  hint: string,
  fieldConfig: string | FieldHookConfig<string>,
}

const TextField = ({label, id, hint, type = "text", fieldConfig}: TextFieldProps) => {
  const [field, meta] = useField(fieldConfig);
  return (
    <>
      <Form.Group as={Col} controlId={id}></Form.Group>
      <Form.Control
        type={type}
        floatingLabel={label}
        {...field}
      />
      {hint && <Form.Control.Feedback>{hint}</Form.Control.Feedback>}
      {meta.error && <Form.Control.Feedack type="invalid">{meta.error}</Form.Control.Feedack>}
    </>
  )
}

export default TextField
