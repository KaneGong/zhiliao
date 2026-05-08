import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src", "data");

export function readJsonFile<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T;
}

export function writeJsonFile<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function readIngredients() {
  return readJsonFile<any[]>("ingredients.json");
}

export function writeIngredients(data: any[]) {
  writeJsonFile("ingredients.json", data);
}

export function readSuppliers() {
  return readJsonFile<any[]>("suppliers.json");
}

export function writeSuppliers(data: any[]) {
  writeJsonFile("suppliers.json", data);
}

export function readTags() {
  return readJsonFile<any>("tags.json");
}

export function writeTags(data: any) {
  writeJsonFile("tags.json", data);
}
