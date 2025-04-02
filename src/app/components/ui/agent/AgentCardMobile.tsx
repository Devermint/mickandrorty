import { Container } from "@chakra-ui/react";
import { AgentCardProps } from "./types";
import { AgentImage } from "./AgentImage";
import { AgentSocials } from "./AgentSocials";
import { AgentDescription } from "./AgentDescription";
import { AgentTraits } from "./AgentTraits";

export function AgentCardMobile({ agent, handleTelegram, handleX }: AgentCardProps) {
  return (
    <Container
      background="linear-gradient(0deg, #040E0B, #040E0B), radial-gradient(446% 189.36% at 53.02% -48.52%, rgba(175, 220, 41, 0.13) 0%, rgba(0, 0, 0, 0) 100%)"
      borderTopLeftRadius="100px"
      boxShadow="0px 0px 32px 0px #F9E0CC1A"
      padding="1.5rem"
    >
      <AgentImage image={agent.image} />
      <AgentSocials name={agent.name} handleTelegram={handleTelegram} handleX={handleX} />
      <AgentDescription bio={agent.bio} />
      <AgentTraits stats={agent.stats} />
    </Container>
  );
}
