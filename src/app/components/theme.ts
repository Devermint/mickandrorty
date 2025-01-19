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
        }
    }
})

const config = deepmerge(defaultConfig, customConfig)
export const system = createSystem(config);
