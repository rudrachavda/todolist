import { Document } from "@/db/schema";

export type Doc<T extends string> = T extends "documents" ? Document & { _id: string } : any;
export type Id<T extends string> = string;
