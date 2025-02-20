import AgentCard from '@/components/AgentCard'
import CurrentAgents from '@/components/CurrentAgents/CurrentAgents'
import EvolutionPath from '@/components/EvolutionPath/EvolutionPath'
import { Box } from '@chakra-ui/react'

const Home = () => {
  return (
    <Box>
      <EvolutionPath></EvolutionPath>
      <CurrentAgents></CurrentAgents>
      <AgentCard
        name="RORTY ZMITH"
        title="Rorty is that jittery, do-good teen tagging along, freaking out while trying to stay 'nice' in a universe that doesn't give a squanch."
        description="Rorty is that jittery, do-good teen tagging along, freaking out while trying to stay 'nice' in a universe that doesn't give a squanch."
        image="/img/Vitalik-Mick.png"
        stats={{
          funny: 5,
          smart: 6,
          cynical: 9,
          compassionate: 8,
        }}
        socialLinks={{
          telegram: 'https://t.me/rortyzmith',
          twitter: 'https://x.com/rortyzmith',
        }}
      ></AgentCard>
    </Box>
  )
}

export default Home
