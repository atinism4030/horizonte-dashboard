"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { EAccountType } from "@/types/account.types";
import { createCompany } from "@/actions/create-account";

// ----------------------
// ZOD SCHEMA
// ----------------------
export const formSchema = z.object({
  name: z.string().min(5).max(255),
  address: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(7),
  description: z.string().min(20).max(1000),
  industries: z.any(),
  working_hours: z.array(z.string()).default([]),
  nr_of_workers: z.number(),
  images: z.array(z.string()).default([]),
  thumbnail: z.string(),
  services: z.array(z.any()).default([]),
  type: z.enum(EAccountType),
  social_media_links: z
    .array(
      z.object({
        facebook: z.string().url().optional().or(z.literal("")),
        instagram: z.string().url().optional().or(z.literal("")),
        tiktok: z.string().url().optional().or(z.literal("")),
        website: z.string().url().optional().or(z.literal("")),
      })
    )
    .default([{ facebook: "", instagram: "", tiktok: "", website: "" }]),
});

export default function BugReportForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      email: "",
      password: "",
      phone: "",
      description: "",
      industries: [""],
      working_hours: [],
      nr_of_workers: 0,
      images: [],
      thumbnail: "",
      services: [],
      type: EAccountType.COMPANY,
      social_media_links: [
        {
          facebook: "",
          instagram: "",
          tiktok: "",
          website: "",
        },
      ],
    },
  });

  const handleCreateCompany = async (data: z.infer<typeof formSchema>) => {
    await createCompany(data);
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const payload = {
      ...data,
      industries: data.industries.split(","),
    };
    await handleCreateCompany(payload);

    toast("You submitted the following values:", {
      description: (
        <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
    });
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />

        <div className="flex mx-auto w-full p-8">
          {/* EXPANDED CARD WIDTH */}
          <Card className="w-full max-w-full">
            <CardHeader>
              <CardTitle>Create Company</CardTitle>
              <CardDescription>Fill out all required fields.</CardDescription>
            </CardHeader>

            <CardContent>
              <form id="company-form" onSubmit={form.handleSubmit(onSubmit)}>
                {/* RESPONSIVE GRID */}
                <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* NAME */}
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Name</FieldLabel>
                        <Input {...field} placeholder="Company Name" />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  {/* ADDRESS */}
                  <Controller
                    name="address"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Address</FieldLabel>
                        <Input {...field} placeholder="Company Address" />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  {/* EMAIL */}
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Email</FieldLabel>
                        <Input {...field} placeholder="email@company.com" />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  {/* PASSWORD */}
                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Password</FieldLabel>
                        <Input {...field} type="password" placeholder="******" />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  {/* PHONE */}
                  <Controller
                    name="phone"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Phone</FieldLabel>
                        <Input {...field} placeholder="+389 xx xxx xxx" />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  {/* DESCRIPTION — FULL WIDTH */}
                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="md:col-span-2"
                      >
                        <FieldLabel>Description</FieldLabel>
                        <InputGroup>
                          <InputGroupTextarea
                            {...field}
                            placeholder="Describe your company..."
                            rows={6}
                          />
                          <InputGroupAddon align="block-end">
                            <InputGroupText>{field.value.length || 0}/1000</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  {/* NUMBER OF WORKERS */}
                  <Controller
                    name="nr_of_workers"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Number of Workers</FieldLabel>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="0"
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  {/* THUMBNAIL */}
                  <Controller
                    name="thumbnail"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Thumbnail URL</FieldLabel>
                        <Input {...field} placeholder="https://..." />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  {/* TYPE */}
                  <Controller
                    name="type"
                    control={form.control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>Account Type</FieldLabel>
                        <select {...field} className="border rounded p-2">
                          {Object.values(EAccountType).map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                  />

                  {/* SOCIAL MEDIA FIELDS */}
                  {["facebook", "instagram", "tiktok", "website"].map((item) => (
                    <Controller
                      key={item}
                      name={`social_media_links.0.${item}` as any}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel>
                            {item.charAt(0).toUpperCase() + item.slice(1)} URL
                          </FieldLabel>
                          <Input {...field} placeholder={`https://${item}.com/...`} />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                  ))}

                  {/* INDUSTRIES */}
                  <Controller
                    name="industries"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className="md:col-span-2">
                        <FieldLabel>Industries, separate by comma</FieldLabel>
                        <Input {...field} placeholder="construction, services..." />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </form>
            </CardContent>

            <CardFooter>
              <Field orientation="horizontal">
                <Button type="button" variant="outline" onClick={() => form.reset()}>
                  Reset
                </Button>
                <Button type="submit" form="company-form">
                  Submit
                </Button>
              </Field>
            </CardFooter>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
