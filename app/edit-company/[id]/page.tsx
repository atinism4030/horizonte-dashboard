"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useFieldArray } from "react-hook-form";
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
    InputGroupInput,
} from "@/components/ui/input-group";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { EAccountType } from "@/types/account.types";
import { updateCompany } from "@/actions/update-account";
import { Badge } from "@/components/ui/badge";
import { uploadFile, uploadMultipleFiles } from "@/actions/upload";
import { Check, Loader2, X, Search, Plus, Trash2, Briefcase } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { formSchema } from "@/app/create-company/page";
import { useParams, useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type FormValues = z.infer<typeof formSchema>;

export default function EditCompanyPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [industries, setIndustries] = React.useState<any[]>([]);
    const [loadingIndustries, setLoadingIndustries] = React.useState(true);
    const [loadingCompany, setLoadingCompany] = React.useState(true);

    // File states
    const [logoFile, setLogoFile] = React.useState<File | null>(null);
    const [additionalImages, setAdditionalImages] = React.useState<File[]>([]);

    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [industrySearch, setIndustrySearch] = React.useState("");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema as any),
        defaultValues: {
            name: "",
            address: "",
            email: "",
            password: "", // Optional in edit? Schema requires it min(6). Maybe remove requirement for edit?
            phone: "",
            description: "",
            industries: [],
            working_hours: [],
            nr_of_workers: 0,
            images: [],
            thumbnail: "",
            services: [],
            type: EAccountType.COMPANY,
            map_url: "",
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

    const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
        control: form.control,
        name: "services",
    });

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingIndustries(true);
                const [indRes, companyRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/industry`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/account/company/${id}`)
                ]);

                setIndustries(indRes.data.data);

                // Populate form
                const company = companyRes.data;
                // Fix social media links format if needed
                const socialLinks = company.social_media_links && company.social_media_links.length > 0
                    ? company.social_media_links
                    : [{ facebook: "", instagram: "", tiktok: "", website: "" }];

                form.reset({
                    ...(company as any),
                    // Don't prefill password (security) - user must enter new one if they want to change?
                    // Actually schema requires password. We might need to handle "if empty, don't update" logic.
                    // But strict schema requires it. For now let's fill with a placeholder or handle it.
                    // But backend `updateAccount` likely hashes it if provided.
                    // The user said "every input should be filled with actual values". DB has hashed password. We can't query it.
                    // We should make password optional in edit schema or just leave it empty and validOnly if changed.
                    password: "unchanged_placeholder", // Hack for now to pass Zod min(6)
                    social_media_links: socialLinks,
                    industries: company.industries?.map((i: any) => typeof i === 'object' ? i._id : i) || [],
                    working_hours: company.working_hours || []
                });

            } catch (error) {
                console.error("Failed to load data", error);
                toast.error("Failed to load company data");
            } finally {
                setLoadingIndustries(false);
                setLoadingCompany(false);
            }
        };
        if (id) fetchData();
    }, [id, form]);

    const filteredIndustries = industries.filter(i =>
        i.name.toLowerCase().includes(industrySearch.toLowerCase())
    );

    // Watch current values for previews
    const currentThumbnail = form.watch("thumbnail");
    const currentImages = form.watch("images") || [];

    async function onSubmit(values: FormValues) {
        setIsSubmitting(true);
        try {
            let thumbnailUrl = values.thumbnail;
            if (logoFile) {
                toast.info("Uploading new logo...", { id: "upload-logo" });
                const uploadRes = await uploadFile(logoFile, "company-logos");
                thumbnailUrl = uploadRes.url;
                toast.success("Logo uploaded", { id: "upload-logo" });
            }

            let imageUrls = [...(values.images || [])]; // Start with existing images

            // Upload new images
            if (additionalImages.length > 0) {
                toast.info("Uploading additional images...", { id: "upload-images" });
                const uploadRes = await uploadMultipleFiles(additionalImages, "company-images");
                const newUrls = uploadRes.map((img: any) => img.url);
                imageUrls = [...imageUrls, ...newUrls];
                toast.success("Images uploaded", { id: "upload-images" });
            }

            const payload: any = {
                ...values,
                thumbnail: thumbnailUrl,
                images: imageUrls,
            };

            // Remove password if placeholder
            if (payload.password === "unchanged_placeholder") {
                delete payload.password;
            }

            await updateCompany(id, payload);

            toast.success("Company updated successfully!");
            // router.push("/dashboard"); 
            // Refresh or stay? User said "fields remain in db".

            setLogoFile(null);
            setAdditionalImages([]);

        } catch (error: any) {
            console.error("Submission error", error);
            toast.error("Failed to update company");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (loadingCompany) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin size-10 text-primary" />
            </div>
        )
    }

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />

                <div className="flex mx-auto w-full p-4 md:p-8 bg-gradient-to-br from-background to-muted/20 min-h-screen">
                    <Card className="w-full max-w-5xl mx-auto shadow-2xl border-primary/10 overflow-hidden bg-card/80 backdrop-blur-sm">
                        <CardHeader className="bg-primary/5 border-b border-primary/10 py-8">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-lg">
                                    <Briefcase className="size-8" />
                                </div>
                                <div>
                                    <CardTitle className="text-3xl font-bold tracking-tight">Edit Company</CardTitle>
                                    <CardDescription className="text-lg">Update company details and settings.</CardDescription>
                                </div>
                            </div>
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
                                                <FieldLabel className="text-sm font-semibold">Legal Company Name</FieldLabel>
                                                <Input {...field} placeholder="e.g. Acme Corporation" className="h-12 rounded-xl" />
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
                                                <FieldLabel className="text-sm font-semibold">Headquarters Address</FieldLabel>
                                                <Input {...field} placeholder="Street, City, Country" className="h-12 rounded-xl" />
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
                                                <FieldLabel className="text-sm font-semibold">Corporate Email</FieldLabel>
                                                <Input {...field} placeholder="office@company.com" className="h-12 rounded-xl" />
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
                                                <FieldLabel className="text-sm font-semibold">New Password (Optional)</FieldLabel>
                                                <Input
                                                    {...field}
                                                    type="password"
                                                    placeholder="Leave unchanged"
                                                    className="h-12 rounded-xl"
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    value={field.value === "unchanged_placeholder" ? "" : field.value}
                                                />
                                                <p className="text-[10px] text-muted-foreground mt-1">Only enter if you wish to change it.</p>
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
                                                <FieldLabel className="text-sm font-semibold">Business Phone</FieldLabel>
                                                <Input {...field} placeholder="+389 7X XXX XXX" className="h-12 rounded-xl" />
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
                                                <FieldLabel className="text-sm font-semibold">Team Size</FieldLabel>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                    placeholder="e.g. 25"
                                                    className="h-12 rounded-xl"
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    {/* DESCRIPTION */}
                                    <Controller
                                        name="description"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field
                                                data-invalid={fieldState.invalid}
                                                className="md:col-span-2"
                                            >
                                                <FieldLabel className="text-sm font-semibold">Company Narrative</FieldLabel>
                                                <div className="relative">
                                                    <InputGroup>
                                                        <InputGroupTextarea
                                                            {...field}
                                                            placeholder="Tell us about your company's mission, values and services..."
                                                            rows={5}
                                                            className="rounded-xl bg-card"
                                                        />
                                                        <InputGroupAddon align="block-end">
                                                            <InputGroupText className="text-[10px] font-bold">{(field.value || "").length}/1000</InputGroupText>
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                </div>
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    {/* THUMBNAIL (LOGO) */}
                                    <Field>
                                        <FieldLabel className="text-sm font-semibold mb-2">Brand Identity (Logo)</FieldLabel>
                                        <div className="flex flex-col gap-3">
                                            <div className={cn(
                                                "relative group w-32 h-32 border-2 border-dashed rounded-3xl flex items-center justify-center overflow-hidden transition-all duration-300 ring-offset-background focus-within:ring-2 focus-within:ring-primary/20",
                                                (logoFile || currentThumbnail) ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5"
                                            )}>
                                                {(logoFile || currentThumbnail) ? (
                                                    <>
                                                        <img
                                                            src={logoFile ? URL.createObjectURL(logoFile) : currentThumbnail}
                                                            alt="Logo preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setLogoFile(null);
                                                                    form.setValue("thumbnail", "");
                                                                }}
                                                                className="bg-white text-primary p-2 rounded-full shadow-lg transform hover:scale-110 transition-transform"
                                                            >
                                                                <X className="size-5" />
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                                                        <div className="bg-muted p-2 rounded-xl">
                                                            <Search className="size-6 opacity-50" />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Upload Logo</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                                                />
                                            </div>
                                        </div>
                                    </Field>

                                    {/* MAP URL */}
                                    <Controller
                                        name="map_url"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel className="text-sm font-semibold">Location Intelligence</FieldLabel>
                                                <div className="space-y-2">
                                                    <InputGroup className="h-12 rounded-xl">
                                                        <InputGroupInput {...field} placeholder="Google Maps Link" className="h-11" />
                                                        {field.value && (
                                                            <InputGroupAddon align="inline-end">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 rounded-lg border-primary/20 hover:bg-primary/5 text-xs font-bold"
                                                                    onClick={() => window.open(field.value, '_blank')}
                                                                >
                                                                    TEST LINK
                                                                </Button>
                                                            </InputGroupAddon>
                                                        )}
                                                    </InputGroup>
                                                </div>
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    {/* IMAGES */}
                                    <Field className="md:col-span-2">
                                        <FieldLabel className="text-sm font-semibold mb-3">Portfolio Showcase</FieldLabel>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                            {/* Existing Images */}
                                            {currentImages.map((url, idx) => (
                                                <div key={`existing-${idx}`} className="relative group aspect-square border-2 border-primary/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                                    <img
                                                        src={url}
                                                        alt={`Existing ${idx}`}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newImages = currentImages.filter((_, i) => i !== idx);
                                                                form.setValue("images", newImages);
                                                            }}
                                                            className="bg-white text-destructive p-1.5 rounded-full hover:bg-white/90 shadow-lg"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* New Images */}
                                            {additionalImages.map((file, idx) => (
                                                <div key={`new-${idx}`} className="relative group aspect-square border-2 border-muted/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`Preview ${idx}`}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => setAdditionalImages(prev => prev.filter((_, i) => i !== idx))}
                                                            className="bg-white text-primary p-1.5 rounded-full hover:bg-white/90 shadow-lg"
                                                        >
                                                            <X className="size-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Add Button */}
                                            <div className="relative aspect-square border-2 border-dashed border-muted-foreground/20 rounded-2xl flex flex-col items-center justify-center hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer group">
                                                <div className="bg-muted p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
                                                    <Search className="size-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <span className="text-[9px] font-black text-muted-foreground group-hover:text-primary mt-2 tracking-widest uppercase">Add View</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        if (e.target.files) {
                                                            setAdditionalImages(prev => [...prev, ...Array.from(e.target.files!)]);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </Field>

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

                                    {/* SOCIAL MEDIA */}
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

                                    {/* SERVICES */}
                                    <div className="md:col-span-2 mt-6">
                                        <div className="bg-muted/30 p-8 rounded-3xl border border-primary/5 shadow-inner">
                                            <div className="flex items-center justify-between mb-6">
                                                <FieldLabel className="text-xl font-bold flex items-center gap-2">
                                                    <Briefcase className="size-6 text-primary" />
                                                    Company Services
                                                </FieldLabel>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => appendService({ name: "", price: "" })}
                                                    className="rounded-xl border-primary/20 hover:bg-primary/5 font-bold"
                                                >
                                                    <Plus className="size-4 mr-2" />
                                                    ADD SERVICE
                                                </Button>
                                            </div>

                                            <div className="space-y-4">
                                                {serviceFields.map((field, index) => (
                                                    <div key={field.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                                                        <div className="sm:col-span-6">
                                                            <Controller
                                                                name={`services.${index}.name` as any}
                                                                control={form.control}
                                                                render={({ field: inputField, fieldState }) => (
                                                                    <Field data-invalid={fieldState.invalid}>
                                                                        <Input {...inputField} placeholder="Service Name" className="h-12 rounded-xl" />
                                                                    </Field>
                                                                )}
                                                            />
                                                        </div>
                                                        <div className="sm:col-span-5">
                                                            <Controller
                                                                name={`services.${index}.price` as any}
                                                                control={form.control}
                                                                render={({ field: inputField, fieldState }) => (
                                                                    <Field data-invalid={fieldState.invalid}>
                                                                        <Input {...inputField} placeholder="Price" className="h-12 rounded-xl" />
                                                                    </Field>
                                                                )}
                                                            />
                                                        </div>
                                                        <div className="sm:col-span-1 flex justify-center pb-1">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeService(index)}
                                                                className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl"
                                                            >
                                                                <Trash2 className="size-5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* INDUSTRIES */}
                                    <Controller
                                        name="industries"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid} className="md:col-span-2 mt-4">
                                                <div className="bg-muted/30 p-8 rounded-3xl border border-primary/5 shadow-inner">
                                                    <FieldLabel className="text-xl font-bold mb-6 flex items-center gap-2">
                                                        <Search className="size-6 text-primary" />
                                                        Industry Classification
                                                    </FieldLabel>
                                                    {/* Selected Badges */}
                                                    <div className="flex flex-wrap gap-2.5 min-h-[60px] mb-8">
                                                        {(field.value || []).map((id: string) => {
                                                            const industry = industries.find(i => i._id === id);
                                                            return (
                                                                <Badge key={id} variant="secondary" className="pl-4 pr-1.5 py-2 text-sm rounded-xl bg-primary text-primary-foreground">
                                                                    {industry?.name || id}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => field.onChange((field.value || []).filter((val: string) => val !== id))}
                                                                        className="ml-2 bg-white/20 hover:bg-white/40 rounded-full p-1 transition-colors"
                                                                    >
                                                                        <X className="size-3" />
                                                                    </button>
                                                                </Badge>
                                                            );
                                                        })}
                                                    </div>
                                                    {/* List */}
                                                    <div className="max-h-72 overflow-y-auto custom-scrollbar p-3 bg-card/60 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 border border-muted/20">
                                                        {filteredIndustries.map((industry) => {
                                                            const isSelected = (field.value || []).includes(industry._id);
                                                            return (
                                                                <button
                                                                    key={industry._id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const current = field.value || [];
                                                                        if (current.includes(industry._id)) {
                                                                            field.onChange(current.filter((id: string) => id !== industry._id));
                                                                        } else {
                                                                            field.onChange([...current, industry._id]);
                                                                        }
                                                                    }}
                                                                    className={cn(
                                                                        "flex items-center justify-between px-5 py-4 text-sm rounded-2xl transition-all duration-300 border-2 active:scale-95 group",
                                                                        isSelected ? "bg-primary border-primary text-primary-foreground" : "bg-background border-transparent hover:border-primary/20"
                                                                    )}
                                                                >
                                                                    <span className="font-bold tracking-tight">{industry.name}</span>
                                                                    {isSelected && <Check className="size-5" />}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </Field>
                                        )}
                                    />

                                    {/* WORKING HOURS */}
                                    <Controller
                                        name="working_hours"
                                        control={form.control}
                                        render={({ field }) => {
                                            const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                                            const currentVal = field.value || [];

                                            // Helper to parse string "Day: Start - End" or "Day: Closed"
                                            const parseDayParams = (day: string) => {
                                                const existing = currentVal.find((s: string) => s.startsWith(day));
                                                if (!existing) return { isOpen: false, start: "09:00", end: "17:00" };
                                                if (existing.includes("Closed")) return { isOpen: false, start: "09:00", end: "17:00" };
                                                const parts = existing.split(": ");
                                                if (parts.length < 2) return { isOpen: true, start: "09:00", end: "17:00" };
                                                const times = parts[1].split(" - ");
                                                return {
                                                    isOpen: true,
                                                    start: times[0] || "09:00",
                                                    end: times[1] || "17:00"
                                                };
                                            };

                                            const updateDay = (day: string, isOpen: boolean, start: string, end: string) => {
                                                const newVal = () => {
                                                    const otherDays = currentVal.filter((s: string) => !s.startsWith(day));
                                                    if (!isOpen) {
                                                        return [...otherDays, `${day}: Closed`];
                                                    }
                                                    return [...otherDays, `${day}: ${start} - ${end}`];
                                                };
                                                field.onChange(newVal().sort((a: string, b: string) => {
                                                    // Sort by day index
                                                    const getIndex = (s: string) => days.findIndex(d => s.startsWith(d));
                                                    return getIndex(a) - getIndex(b);
                                                }));
                                            };

                                            return (
                                                <Field className="md:col-span-2 mt-4">
                                                    <div className="bg-muted/30 p-8 rounded-3xl border border-primary/5 shadow-inner">
                                                        <FieldLabel className="text-xl font-bold mb-6 flex items-center gap-2">
                                                            <span className="text-primary">🕒</span> Working Hours
                                                        </FieldLabel>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {days.map(day => {
                                                                const { isOpen, start, end } = parseDayParams(day);
                                                                return (
                                                                    <div key={day} className="flex items-center justify-between p-3 bg-card rounded-xl border border-muted/20">
                                                                        <div className="flex items-center gap-3">
                                                                            <Checkbox
                                                                                checked={isOpen}
                                                                                onCheckedChange={(checked) => updateDay(day, !!checked, start, end)}
                                                                                id={`wh-${day}`}
                                                                            />
                                                                            <Label htmlFor={`wh-${day}`} className="font-semibold w-24">{day}</Label>
                                                                        </div>
                                                                        {isOpen ? (
                                                                            <div className="flex items-center gap-2">
                                                                                <Input
                                                                                    type="time"
                                                                                    value={start}
                                                                                    className="w-24 h-9"
                                                                                    onChange={(e) => updateDay(day, true, e.target.value, end)}
                                                                                />
                                                                                <span className="text-muted-foreground">-</span>
                                                                                <Input
                                                                                    type="time"
                                                                                    value={end}
                                                                                    className="w-24 h-9"
                                                                                    onChange={(e) => updateDay(day, true, start, e.target.value)}
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-muted-foreground text-sm italic pr-4">Closed</span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </Field>
                                            );
                                        }}
                                    />

                                </FieldGroup>
                                <CardFooter className="bg-primary/5 border-t border-primary/10 py-10 px-10 mt-6">
                                    <div className="flex flex-col sm:flex-row gap-6 w-full justify-between items-center">
                                        <div className="max-w-md">
                                            <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-1">Update Confirmation</h4>
                                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                                Changes will be reflected immediately across the platform.
                                            </p>
                                        </div>
                                        <div className="flex gap-4 w-full sm:w-auto">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="flex-1 sm:flex-none hover:bg-destructive/10 hover:text-destructive rounded-2xl h-14 px-10 font-bold transition-all"
                                                onClick={() => router.back()}
                                            >
                                                CANCEL
                                            </Button>
                                            <Button
                                                type="submit"
                                                form="company-form"
                                                disabled={isSubmitting}
                                                className="flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl h-14 px-16 font-black shadow-[0_10px_30px_-10px_rgba(var(--primary),0.5)] transition-all active:scale-95 disabled:opacity-70 group"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                                        UPDATING...
                                                    </>
                                                ) : (
                                                    <>
                                                        SAVE CHANGES
                                                        <Check className="ml-3 size-5 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardFooter>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
