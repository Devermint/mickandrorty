import { Agent } from '@/app/lib/agent';
import { ChatEntry, GroupChatEntry } from '@/app/lib/chat';

export const testingAgents: Agent[] = [
    {
        id: 0,
        name: "Mick Zanches",
        bio: "Yeah Rorty, I’m that genius, booze-guzzling scientist yanking you through a bazillion dimensions. Deal with it.",
        stats: {
            funny: 9,
            smart: 10,
            cynical: 9,
            compassionate: 1
        },
        image: "/agents/agent1.png"
    },
    {
        id: 1,
        name: "Mick Zanches",
        bio: "Yeah Rorty, I’m that genius, booze-guzzling scientist yanking you through a bazillion dimensions. Deal with it.",
        stats: {
            funny: 9,
            smart: 10,
            cynical: 9,
            compassionate: 1
        },
        image: "/agents/agent2.png"
    },
    {
        id: 2,
        name: "Mick Zanches",
        bio: "Yeah Rorty, I’m that genius, booze-guzzling scientist yanking you through a bazillion dimensions. Deal with it.",
        stats: {
            funny: 9,
            smart: 10,
            cynical: 9,
            compassionate: 1
        },
        image: "/agents/agent3.png"
    },
]

export const testingChats: ChatEntry[] = [
    {
        sender: "",
        message: "Yeah Rorty, I’m that genius, booze-guzzling scientist yanking you through a bazillion dimensions. Deal with it.",
        alignment: "left",
    },
]

export const testingGroupChats: GroupChatEntry[] = [
    {
        id: 0,
        name: "Mick Zanches",
        icon: "/agents/agent1.png"
    },
    {
        id: 1,
        name: "Mick Zanches",
        icon: "/agents/agent2.png"
    },
    {
        id: 2,
        name: "Mick Zanches",
        icon: "/agents/agent3.png"
    }
]
