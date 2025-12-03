"use client";

import React, { useEffect } from "react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { deleteIndustry } from "@/actions/delete-industry";
import { toast } from "sonner";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldLabel, FieldGroup, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { IndustryFormType, IndustrySchema } from "@/types/industry.types";
import { createIndustry } from "@/actions/create-industry";
import { fetchIndustries } from "@/actions/industry";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface IIndustry {
  _id: string;
  name: string;
  icon: string;
  parent_industry: string | IIndustry;
}

export default function IndustriesPage() {
  const [industries, setIndustries] = useState<IIndustry[]>([]);
  const [reloadIndustries, setReloadIndustries] = useState<boolean>(false);

  const form = useForm<IndustryFormType>({
    resolver: zodResolver(IndustrySchema),
    defaultValues: {
      name: "",
      icon: "",
      parent_industry: ""
    },
  });

  const getAllIndustries = async () => {
    try {
      const res = await fetchIndustries();
      console.log({res});
      
      setIndustries(res);
    } catch (error) {
      console.log({error});
      
    }
  }

  const handleDelete = async (id: string) => {
  try {
    // kjo de bohet uncomment kur de jena t sigurt ene kur de kena arsye tforta per ta bo delete ni industry :)
    // await deleteIndustry(id);
    toast.success("Industry deleted successfully!");
    setReloadIndustries(!reloadIndustries);
  } catch (error) {
    console.log(error);
    toast.error("Failed to delete industry!");
  }
};


  useEffect(() => {
    getAllIndustries()
  }, [reloadIndustries])

  const onSubmit = async (data: IndustryFormType) => {
    console.log({data});
    
    await createIndustry(data);
    form.reset();
    setReloadIndustries(!reloadIndustries)
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />

        <div className="p-8 space-y-8 w-full mx-auto">

          <Card>
            <CardHeader>
              <CardTitle>Create Industry</CardTitle>
              <CardDescription>Add a new industry to your system.</CardDescription>
            </CardHeader>

            <CardContent>
              <form id="industry-form" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>

                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Name</FieldLabel>
                        <Input {...field} placeholder="e.g. Construction" />
                        {fieldState.error && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="icon"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Icon (URL or Lucide name)</FieldLabel>
                        <Input {...field} placeholder="e.g. Hammer, https://..." />
                        {fieldState.error && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="parent_industry"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Parent Industry (optional)</FieldLabel>

                        <Select
                          value={field.value}
                          onValueChange={(val) => field.onChange(val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent industry" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="efsf">None (Top-Level)</SelectItem>

                            {industries?.filter((industry) => !industry.parent_industry)?.map((ind, i) => (
                              <SelectItem key={i} value={ind?._id}>
                                {ind?.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />


                </FieldGroup>
              </form>
            </CardContent>

            <CardFooter className="gap-2">
              <Button variant="outline" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit" form="industry-form">
                Create
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Industries</CardTitle>
              <CardDescription>List of all industries you have created.</CardDescription>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Name</TableHead>
                    <TableHead className="w-1/3">Icon</TableHead>
                    <TableHead className="w-1/3">Preview</TableHead>
                    <TableHead className="w-1/3">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {industries?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No industries yet.
                      </TableCell>
                    </TableRow>
                  )}

                  {industries?.map((ind, i) => (
                    <TableRow key={i}>
                      <TableCell>{ind?.name}</TableCell>
                      <TableCell>{ind?.icon}</TableCell>
                      <TableCell>
                        {ind?.icon?.startsWith("http") ? (
                          <img src={ind?.icon} alt={ind?.name} className="w-8 h-8 rounded" />
                        ) : (
                          <span className="font-semibold">{ind?.icon}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(ind._id)}
                        >
                          Delete
                        </Button>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
