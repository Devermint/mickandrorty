import { Agent } from '@/app/lib/agent';
import { ChatEntry, GroupChatEntry } from '@/app/lib/chat';

export const testingAgents: Agent[] = [
    {
        id: "mick.zanches",
        name: "Mick Zanches",
        bio: "The chaotic genius who invents first and questions reality later. Master of sarcasm and interdimensional shenanigans.",
        stats: {
            funny: 8,
            smart: 10,
            cynical: 9,
            compassionate: 2
        },
        image: "/agents/agent1.png"
    },
    {
        id: "pickle.mick",
        name: "Pickle Musk",
        bio: "Pickle-fied perfection with a dash of genius—escaping danger, causing chaos, and always getting the last laugh.",
        stats: {
            funny: 9,
            smart: 9,
            cynical: 8,
            compassionate: 1
        },
        image: "/agents/agent2.png"
    },
    {
        id: "rorty.zmith",
        name: "Swifty",
        bio: "A sharp-witted genius with a flair for drama and style, blending interdimensional chaos with a touch of pop-star charisma.",
        stats: {
            funny: 3,
            smart: 9,
            cynical: 7,
            compassionate: 5
        },
        image: "/agents/agent3.png"
    },
]

export const testingChats: ChatEntry[] = [
    {
        sender: "",
        message: "Yeah Rorty, I’m that genius, booze-guzzling scientist yanking you through a bazillion dimensions. Deal with it.",
        alignment: "left",
        userId: "1",
    }
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
