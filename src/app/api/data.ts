import { Agent } from '@/app/lib/agent';
import { ChatEntry, GroupChatEntry } from '@/app/lib/chat';

export const testingAgents: Agent[] = [
    {
        id: "mick.zanches",
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
        id: "pickle.mick",
        name: "Pickle Mick",
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
        id: "rorty.zmith",
        name: "Rorty Zmith",
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
        name: "Pickle Mick",
        icon: "/agents/agent2.png"
    },
    {
        id: 2,
        name: "Rorty Zmith",
        icon: "/agents/agent3.png"
    }
]

export const testingAgentGroupMap: Record<number, string[]> = {
    0: ["mick.zanches"],
    1: ["pickle.mick"],
    2: ["rorty.zmith"],
}
