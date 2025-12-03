import z from "zod";

export interface IIndustry {
    name: string,
    icon: string,
    parent_industry?: string | IIndustry; 
}


export const IndustrySchema = z.object({
  name: z.string().min(2, "Name is required"),
  icon: z.string().min(2, "Icon is required"),
  parent_industry: z.string()
});

export type IndustryFormType = z.infer<typeof IndustrySchema>;
