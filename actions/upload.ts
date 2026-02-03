import axios from "axios";
import { env } from "@/env";

export const uploadFile = async (file: File, folder: string = "general") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
        const response = await axios.post(`${env.apiurl}/account/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.data;
    } catch (error) {
        console.error("Upload error:", error);
        throw error;
    }
};

export const uploadMultipleFiles = async (files: FileList | File[], folder: string = "general") => {
    const formData = new FormData();
    const filesArray = Array.from(files);
    filesArray.forEach((file) => {
        formData.append("files", file);
    });
    formData.append("folder", folder);

    try {
        const response = await axios.post(`${env.apiurl}/account/upload-multiple`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.data;
    } catch (error) {
        console.error("Upload multiple error:", error);
        throw error;
    }
};
