#!/usr/bin/env node
import { readFile } from "node:fs/promises";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const arg = process.argv[index];
  if (!arg.startsWith("--")) continue;
  const key = arg.slice(2);
  const next = process.argv[index + 1];
  if (!next || next.startsWith("--")) {
    args.set(key, "true");
  } else {
    args.set(key, next);
    index += 1;
  }
}

const endpoint = args.get("endpoint") || process.env.WORKSTATION_CAPTURE_ENDPOINT || "https://andy-workstation.pages.dev/api/codex-capture";
const textFile = args.get("text-file");
const text = textFile ? await readFile(textFile, "utf8") : args.get("text") || "";
const tags = (args.get("tags") || "")
  .split(/[，,、;]/)
  .map((tag) => tag.trim())
  .filter(Boolean);

const payload = {
  url: args.get("url") || "",
  ticker: args.get("ticker") || "",
  companyName: args.get("company") || "",
  title: args.get("title") || "",
  source: args.get("source") || "",
  tags,
  text
};

const headers = { "content-type": "application/json" };
if (process.env.WORKSTATION_CAPTURE_TOKEN) headers["x-codex-token"] = process.env.WORKSTATION_CAPTURE_TOKEN;

const response = await fetch(endpoint, {
  method: "POST",
  headers,
  body: JSON.stringify(payload)
});

const body = await response.text();
if (!response.ok) {
  console.error(body);
  process.exit(1);
}

const data = JSON.parse(body);
console.log(JSON.stringify({
  saved: Boolean(data.item?.id),
  title: data.item?.title,
  ticker: data.company?.ticker || payload.ticker,
  backend: data.backend
}, null, 2));
