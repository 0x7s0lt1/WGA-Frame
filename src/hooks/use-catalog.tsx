"use client";
import { useContext } from "react";
import { CatalogContext } from "@/contexts/catalog-provider";

export default function useCatalog() {
    const context = useContext(CatalogContext);
    if (!context) throw new Error("useCatalog must be used inside <CatalogProvider>");
    return context;
}
