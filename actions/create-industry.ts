import { env } from "@/env";
import { IndustryFormType } from "@/types/industry.types";
import axios from "axios";

export const createIndustry = async (data: IndustryFormType) => {
    try {
        const response = await axios.post(`${env.apiurl}/industry/create`, {data: data});
        console.log({response});
        return response.data.data;
    } catch (error) {
        console.log({error});
    }
}

