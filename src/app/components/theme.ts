import { createSystem, defaultConfig, defineConfig, defineRecipe } from '@chakra-ui/react';
import deepmerge from 'deepmerge';

const buttonRecipe = defineRecipe({
    base: {
        background: "#1D3114",
        borderWidth: "1px",
        borderColor: "#AFDC296E",
        borderRadius: "14px",
        color: "#AFDC29",
        fontWeight: 700,
        fontSize: "16px",
        lineHeight: "24px",
    },
    variants: {
        social: {
            true: {
                background: "#042911"
            }
        }
    }
})

const textRecipe = defineRecipe({
    base: {
        color: "#AFDC29"
    },
})

const customConfig = defineConfig({
    theme: {
        recipes: {
            button: buttonRecipe,
            text: textRecipe
        },
        keyframes: {
            bounce1: {
                "0%": { transform: "scale(1, 1)" },
                "25%": { transform: "scale(1, 1.5)" },
                "50%": { transform: "scale(1, 0.67)" },
                "75%": { transform: "scale(1, 1)" },
                "100%": { transform: "scale(1, 1)" }
            },
            bounce2: {
                "0%": { transform: "scale(1, 1)" },
                "25%": { transform: "scale(1, 1)" },
                "50%": { transform: "scale(1, 1.5)" },
                "75%": { transform: "scale(1, 1)" },
                "100%": { transform: "scale(1, 1)" }
            },
            bounce3: {
                "0%": { transform: "scale(1, 1)" },
                "25%": { transform: "scale(1, 1)" },
                "50%": { transform: "scale(1, 0.67)" },
                "75%": { transform: "scale(1, 1.5)" },
                "100%": { transform: "scale(1, 1)" }
            }
        },
        tokens: {
            animations: {
                bounce1: { value: "bounce1 1s infinite linear" },
                bounce2: { value: "bounce2 1s infinite linear" },
                bounce3: { value: "bounce3 1s infinite linear" }
            }
        }
    }
})

const config = deepmerge(defaultConfig, customConfig)
export const system = createSystem(config);
