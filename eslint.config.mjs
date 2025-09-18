import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const config = tseslint.config(
  ...compat.extends("prettier"),
  {
    plugins: {
      react: reactPlugin,
    },
    rules: {
      ...reactPlugin.configs["jsx-runtime"].rules,
    },
    settings: {
      react: {
        version: "detect", // You can add this if you get a warning about the React version when you lint
      },
    },
  },
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@next/next/no-img-element": "off",
    },
  },
  {
    ignores: [".next/*", "next-env.d.ts"],
  },
  tseslint.configs.recommended,
  {
    plugins: {},
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],

    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);

export default config;
