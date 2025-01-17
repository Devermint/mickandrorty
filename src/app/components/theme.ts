import { createSystem, defaultBaseConfig, defaultConfig, defaultSystem, defineConfig, defineRecipe, mergeConfigs } from '@chakra-ui/react';

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
    }
})

const textRecipe = defineRecipe({
    base: {
        color: "#AFDC29"
    }
})

const customConfig = defineConfig({
    theme: {
        recipes: {
            button: buttonRecipe,
            text: textRecipe
        }
    }
})

export const system = createSystem(defaultConfig, customConfig);
