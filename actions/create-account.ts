import { formSchema } from "@/app/create-company/page";
import { env } from "@/env";
import axios from "axios";
import z from "zod";

export const createCompany = async (data: z.infer<typeof formSchema>) => {
    try {
        const response = await axios.post(`${env.apiurl}/account/create-company-account`, {data: data});
        console.log({response});
        return response.data.data;
    } catch (error) {
        console.log({error});
    }
}

