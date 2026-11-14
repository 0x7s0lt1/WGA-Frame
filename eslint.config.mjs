import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
    ...nextCoreWebVitals,
    ...nextTypescript,
    {
        rules: {
            // Artwork images come from wga.hu at runtime; next/image would proxy every one of them.
            "@next/next/no-img-element": "off",
        },
    },
    {
        ignores: [".next/**", "node_modules/**", "public/**", "next-env.d.ts"],
    },
];

export default config;
