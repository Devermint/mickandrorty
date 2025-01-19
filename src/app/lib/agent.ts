export type AgentCharacteristics = {
    funny: number;
    smart: number;
    cynical: number;
    compassionate: number;
}

export type Agent = {
    id: number;
    name: string;
    bio: string;
    stats: AgentCharacteristics;
    image: string;

    linkChat?: string;
    linkX?: string;
};
