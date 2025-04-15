// src/lib/parser.ts
import { parseReplaybookJson } from "@/utils/parseReplaybookJson";

export function refineReplaybookJson(input: string) {
  try {
    const raw = JSON.parse(input);
    return parseReplaybookJson(raw);
  } catch (error) {
    throw new Error("Invalid JSON input");
  }
}
