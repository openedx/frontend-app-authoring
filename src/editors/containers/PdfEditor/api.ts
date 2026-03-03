import {useQuery} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import {EditorState, selectors} from "@src/editors/data/redux";

const useBlockData = (blockId: string) => {
  const baseUrl = useSelector((state: EditorState) => selectors.app.studioEndpointUrl(state))
  return useQuery({
  queryKey: ['pdfData'],
  queryFn: () =>
    fetch(`${baseUrl}/xblocks/${blockId}/load_pdf/`).then((res) =>
      res.json(),
    ),
})}
