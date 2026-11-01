import { createFileRoute } from "@tanstack/react-router";
import { UsageMap } from "@/components/usage-map";

export const Route = createFileRoute("/")({ component: UsageMap });
