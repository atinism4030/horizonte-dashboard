"use server";

import { env } from "@/env";

export async function deleteIndustry(id: string) {
  const res = await fetch(`${env.apiurl}/industry/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Failed to delete industry");

  return res.json();
}
