import { EAccountType } from "@/types/account.types";
import axios from "axios";
import { env } from "@/env";

export const fetchAccounts = async (type: EAccountType) => {
    try {
        const response = await axios.get(`${env.apiurl}/account/accounts?type=${type}`);
        console.log({response});
        return response.data.data;
    } catch (error) {
    }
}
