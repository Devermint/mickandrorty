import { Agent } from "./agent";

export type ChatEntry = {
    userId: string | undefined;
    sender: string;
    message: string;
    alignment: "left" | "right" | "error";
    messageId?: string; // Unique ID for the message
    responseToMessageId?: string | null; // ID of the message this is responding to
    isResponseTo?: boolean; // Whether this message is a response
    action?: string;
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
    subscribe?: (callback: (entries: ChatEntry[]) => void) => (() => void);
    disconnect?: () => void;
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

export class StreamedChatAdapter extends BaseChatAdapter implements ChatAdapter {
    private agent: Agent;
    private eventSource: EventSource | null = null;
    private messageQueue: string[] = [];
    private isProcessing: boolean = false;

    constructor(agent: Agent) {
        super();
        this.agent = agent;
        this.connectToStream();
    }

    getName() {
        return this.agent.name;
    }

    getImage() {
        return this.agent.image;
    }

    private connectToStream() {
        this.eventSource = new EventSource('http://localhost:2800/messages/stream');
        
        this.eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.messageQueue.push(data.content);
            this.processNextMessage();
        };

        this.eventSource.onerror = (error) => {
            console.error('EventSource failed:', error);
            this.eventSource?.close();
            this.eventSource = null;
            // Attempt to reconnect after 5 seconds
            setTimeout(() => this.connectToStream(), 5000);
        };
    }

    private async processNextMessage() {
        if (this.isProcessing || this.messageQueue.length === 0) {
            return;
        }

        this.isProcessing = true;
        const message = this.messageQueue.shift()!;

        try {
            await this.sendChatMessage(message);
        } catch (error) {
            console.error('Failed to process message:', error);
        } finally {
            this.isProcessing = false;
            this.processNextMessage(); // Process next message if available
        }
    }

    async getChatEntries() {
        return fetch(`/api/chats/${this.agent.id}`)
            .then((res) => res.json())
            .then((data) => data as ChatEntry[]);
    }

    async sendChatMessage(message: string) {
        return fetch(`/api/chats/text`, {
            method: "POST",
            body: JSON.stringify({
                agent: this.agent.id,
                message: message,
                userId: this.userId,
                roomId: this.roomId
            }),
        });
    }

    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }
}
