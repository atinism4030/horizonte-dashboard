import { formSchema } from "@/app/create-company/page";
import { env } from "@/env";
import axios from "axios";
import z from "zod";

export const updateCompany = async (id: string, data: Partial<z.infer<typeof formSchema>>) => {
    try {
        const response = await axios.patch(`${env.apiurl}/account/edit/${id}`, data);
        console.log({ response });
        return response.data.data;
    } catch (error) {
        console.log({ error });
        throw error;
    }
}
