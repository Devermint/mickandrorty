import { Agent } from "./agent";

export type ChatEntry = {
    sender: string;
    message: string;
    alignment: "left" | "right" | "error";
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

class BaseChatAdapter {
    userId: string;
    roomId: string;

    constructor() {
        this.userId = this.generateId(12);
        this.roomId = this.generateId(12);
    }

    private generateId(size: number) {
        return [...Array(size)]
            .map(() => Math.floor(Math.random() * 36).toString(36))
            .join("");
    }
}

export class AgentDMChatAdapter extends BaseChatAdapter implements ChatAdapter {
    private agent: Agent;

    constructor(agent: Agent) {
        super();
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
        return fetch(`/api/chats/text`, {
            method: "POST",
            body: JSON.stringify({agent: this.agent.id,  message: message, userId: this.userId, roomId: this.roomId}),
        });
    }
}

export class GroupChatAdapter extends BaseChatAdapter implements ChatAdapter {
    private group: GroupChatEntry;

    constructor(group: GroupChatEntry) {
        super();
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

    async sendChatMessage(message: string) : Promise<Response> {
        return fetch(`/api/chats/group`, {
            method: "POST",
            body: JSON.stringify({ group: this.group.id, message: message, userId: this.userId, roomId: this.roomId }),
        });
    }
}
