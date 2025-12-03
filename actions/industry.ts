import axios from "axios";
import { env } from "@/env";
import { IIndustry } from "@/types/industry.types";

export const fetchIndustries = async () => {
    try {
        const response = await axios.get(`${env.apiurl}/industry/`);
        console.log({response: response.data.data});
        return response.data.data as IIndustry[];
    } catch (error) {
        console.log(error);
    }
}
