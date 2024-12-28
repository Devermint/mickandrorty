import { mainnet, polygon, sepolia, optimism, arbitrum, base } from 'wagmi/chains'
import { createConfig, http } from 'wagmi'

export const config = createConfig({
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
})
