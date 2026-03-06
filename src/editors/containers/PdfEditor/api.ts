import {useQuery} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import {EditorState, selectors} from "@src/editors/data/redux";
import {camelizeKeys} from "@src/editors/utils";
import {getAuthenticatedHttpClient} from "@edx/frontend-platform/auth";
import {AxiosResponse} from "axios";

export const useBlockData = <T>(blockId: string) => {
  const baseUrl = useSelector((state: EditorState) => selectors.app.studioEndpointUrl(state))
  const client = getAuthenticatedHttpClient();
  return useQuery<T>({
    queryKey: ['blockData', blockId],
    staleTime: Infinity,
    queryFn: () =>
      client.get(`${baseUrl}/xblock/${blockId}/handler/load_pdf`).then((res: AxiosResponse<unknown>) =>
        camelizeKeys(res.data) as T,
      )
  }
)}
