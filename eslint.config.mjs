import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "url";
import path from "path";
const dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: dirname });
export default [
  { ignores: [".next/**", ".next-dev/**", ".open-next/**", "node_modules/**", "public/**", "screenshots/**", "dist/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { rules: {
    "@typescript-eslint/no-unused-vars": "warn",
    "react/no-unescaped-entities": "off",
    "@next/next/no-img-element": "warn",
  } },
];
