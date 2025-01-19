import { Agent } from "./agent";

export type ChatEntry = {
    sender: string;
    message: string;
    alignment: "left" | "right";
}

export type GroupChatEntry = {
    id: number;
    name: string;
    icon: string;
}

export interface ChatAdapter {
    getName: () => string;
    getImage: () => string;
    getChatEntries: () => Promise<ChatEntry[]>;
    sendChatMessage: (message: string) => Promise<Response>;
}

export class AgentDMChatAdapter implements ChatAdapter {
    private agent: Agent;

    constructor(agent: Agent) {
        this.agent = agent;
    }

    getName() {
        return this.agent.name;
    }

    getImage() {
        return this.agent.image;
    }

    async getChatEntries() {
        return fetch(`/api/chats/${this.agent.id}`)
            .then((res) => res.json())
            .then((data) => data as ChatEntry[]);
    }

    async sendChatMessage(message: string) {
        return fetch(`/api/chats/${this.agent.id}`, {
            method: "POST",
            body: JSON.stringify({ message }),
        });
    }
}

export class GroupChatAdapter implements ChatAdapter {
    private group: GroupChatEntry;

    constructor(group: GroupChatEntry) {
        this.group = group;
    }

    getName() {
        return this.group.name;
    }

    getImage() {
        return this.group.icon;
    }

    async getChatEntries() {
        return fetch(`/api/chats/group/${this.group.id}`)
            .then((res) => res.json())
            .then((data) => data as ChatEntry[]);
    }

    async sendChatMessage(message: string) {
        return fetch(`/api/chats/group/${this.group.id}`, {
            method: "POST",
            body: JSON.stringify({ message }),
        });
    }
}
