import { env } from "@/env";
import axios from "axios";

export const deleteCompany = async (id: string) => {
    try {
        // const response = await axios.delete(`${env.apiurl}/account/delete/${id}`);
        // console.log({response});
        // return response.data.data;
        return null;
    } catch (error) {
        console.log({ error });
    }
}

