import { db } from './firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, where, getDocs, Timestamp, addDoc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { ChatAdapter, ChatEntry, GroupChatEntry } from './chat';
import { Agent } from './agent';

// Create caches to store adapter instances
const adapterCache = new Map<string, FirebaseGroupChatAdapter>();
const agentAdapterCache = new Map<string, FirebaseAgentChatAdapter>();

export interface FirebaseMessage {
  id?: string;
  text: string;
  senderId: string;
  senderType: 'user' | 'agent';
  createdAt: Timestamp;
  status: 'pending' | 'sent' | 'read';
  responseToMessageId?: string | null; // ID of the message this is responding to
  isResponseTo: boolean; // Whether this message is a response
}

export interface FirebaseChat {
  id?: string;
  type: 'private' | 'public';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  agentInfo: {
    agentId: string;
    name: string;
    avatarUrl: string;
  };
  userId: string | null;
  status: 'active' | 'queued' | 'completed';
}

export class FirebaseGroupChatAdapter implements ChatAdapter {
  private group!: GroupChatEntry;
  private chatEntries: ChatEntry[] = [];
  private unsubscribe: (() => void) | null = null;
  private userId!: string;
  private chatId: string | null = null;
  private subscribers: ((entries: ChatEntry[]) => void)[] = [];
  private isInitialized: boolean = false;

  constructor(group: GroupChatEntry) {
    // Check if we already have an adapter for this group
    const groupId = group.id.toString();
    const existingAdapter = adapterCache.get(groupId);
    
    if (existingAdapter) {
      // Return the existing adapter instance
      Object.assign(this, existingAdapter);
      return;
    }
    
    this.group = group;
    this.userId = this.generateId(12);
    
    // Store this adapter in the cache
    adapterCache.set(groupId, this);
    
    // Connect to Firebase
    this.connectToFirebase();
  }

  // Add a subscribe method to allow components to listen for updates
  subscribe(callback: (entries: ChatEntry[]) => void): () => void {
    this.subscribers.push(callback);
    
    // Immediately call with current entries if available
    if (this.chatEntries.length > 0) {
      callback(this.chatEntries);
    }
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private generateId(size: number) {
    return [...Array(size)]
      .map(() => Math.floor(Math.random() * 36).toString(36))
      .join("");
  }

  getName() {
    return this.group.name;
  }

  getImage() {
    return this.group.icon;
  }

  private async createOrGetChat() {
    if (this.chatId) return this.chatId;

    // Use a transaction to ensure atomicity
    const agentId = this.group.id.toString();
    
    // Create a document reference with a predictable ID based on the agent
    // This ensures we always reference the same document for a given agent
    const chatDocRef = doc(db, 'chats', `public_${agentId}`);
    
    try {
      // Try to get the document
      const chatDoc = await getDoc(chatDocRef);
      
      if (chatDoc.exists()) {
        // Chat already exists
        this.chatId = chatDoc.id;
        return this.chatId;
      }
      
      // Create the chat with a predetermined ID
      await setDoc(chatDocRef, {
        type: 'public',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        agentInfo: {
          agentId: agentId,
          name: this.group.name,
          avatarUrl: this.group.icon
        },
        userId: null,
        status: 'active'
      });
      
      this.chatId = chatDocRef.id;
      return this.chatId;
    } catch (error) {
      console.error("Error creating/getting chat:", error);
      throw error;
    }
  }

  private async connectToFirebase() {
    // First ensure we have a chat ID
    await this.createOrGetChat();
    
    // Now listen for messages in this chat
    const messagesRef = collection(db, 'chats', this.chatId!, 'messages');
    const q = query(
      messagesRef,
      orderBy('createdAt', 'asc'),
    );

    // Set up real-time listener
    this.unsubscribe = onSnapshot(q, (snapshot) => {
      const newEntries: ChatEntry[] = [];
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data() as FirebaseMessage;
        
        if (data.senderType === 'user') {
          // Add user message
          newEntries.push({
            sender: 'User',
            message: data.text,
            alignment:  'right', // Align based on sender
            messageId: doc.id,
            responseToMessageId: data.responseToMessageId,
            isResponseTo: data.isResponseTo
          });
        } else if (data.senderType === 'agent') {
          // Add agent response
          newEntries.push({
            sender: this.group.name,
            message: data.text,
            alignment: 'left',
            messageId: doc.id,
            responseToMessageId: data.responseToMessageId,
            isResponseTo: data.isResponseTo
          });
        }
      });
      
      // Update chat entries
      this.chatEntries = newEntries;
      
      // Notify subscribers
      this.subscribers.forEach(callback => callback(newEntries));
    }, (error) => {
      console.error("Error listening to messages:", error);
    });
  }

  async getChatEntries(): Promise<ChatEntry[]> {
    // If we don't have any entries yet and we have a chatId, 
    // fetch them manually to ensure we have initial data
    console.log(this.chatEntries, "chatEntries", 'heeeey');
    if (this.chatEntries.length === 0 && this.chatId) {
      try {
        console.log(this.chatId, "chatId");
        const messagesRef = collection(db, 'chats', this.chatId, 'messages');
        const q = query(
          messagesRef,
          orderBy('createdAt', 'asc'),
        );
        
        const snapshot = await getDocs(q)
        const entries: ChatEntry[] = [];
        console.log(snapshot, "snapshot")
        snapshot.docs.forEach((doc) => {
          const data = doc.data() as FirebaseMessage;
          
          if (data.senderType === 'user') {
            entries.push({
              sender: 'User',
              message: data.text,
              alignment:  'right',
              messageId: doc.id,
              responseToMessageId: data.responseToMessageId,
              isResponseTo: data.isResponseTo
            });
          } else if (data.senderType === 'agent') {
            entries.push({
              sender: this.group.name,
              message: data.text,
              alignment: 'left',
              messageId: doc.id,
              responseToMessageId: data.responseToMessageId,
              isResponseTo: data.isResponseTo
            });
          } 
        });
        
        // Only update if we still don't have entries (to avoid race conditions)
        if (this.chatEntries.length === 0) {
          this.chatEntries = entries;
        }
      } catch (error) {
        console.error("Error fetching initial messages:", error);
      }
    }
    
    return this.chatEntries;
  }

  async sendChatMessage(message: string): Promise<Response> {
    // Ensure we have a chat
    // const chatId = await this.createOrGetChat();
    
    // Get the agent ID
    const agentId = this.group.id.toString();
    
    // Add a message to the agent's queue
    const agentQueueRef = collection(db, 'agentQueues', agentId, 'messages');

    const queueDoc = await addDoc(agentQueueRef, {
      chatId: "public_1",
      content: message,
      userId: this.userId,
      roomId: "public_1",
      status: "pending",
      senderName: 'User',
      attempts: 0,
      originalMessageId: null
    });

    // Return success response immediately
    return new Response(JSON.stringify({ 
      status: 'queued', 
      messageId: queueDoc.id,
      agentId: agentId
    }), {
      status: 202, // Accepted
      headers: { 'Content-Type': 'application/json' }
    });
  }

  disconnect() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

// Also keep the original adapter for direct agent chats
export class FirebaseAgentChatAdapter implements ChatAdapter {
  private agent!: Agent;
  private chatEntries: ChatEntry[] = [];
  private unsubscribe: (() => void) | null = null;
  private userId!: string;
  private chatId: string | null = null;
  private subscribers: ((entries: ChatEntry[]) => void)[] = [];
  private isInitialized: boolean = false;

  constructor(agent: Agent) {
    // Check if we already have an adapter for this agent
    const agentId = agent.id.toString();
    const existingAdapter = agentAdapterCache.get(agentId);
    
    if (existingAdapter) {
      // Return the existing adapter instance
      Object.assign(this, existingAdapter);
      return;
    }
    
    this.agent = agent;
    this.userId = this.generateId(12);
    
    // Store this adapter in the cache
    agentAdapterCache.set(agentId, this);
    
    // Connect to Firebase
    this.connectToFirebase();
  }

  // Add a subscribe method to allow components to listen for updates
  subscribe(callback: (entries: ChatEntry[]) => void): () => void {
    this.subscribers.push(callback);
    
    // Immediately call with current entries if available
    if (this.chatEntries.length > 0) {
      callback(this.chatEntries);
    }
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private generateId(size: number) {
    return [...Array(size)]
      .map(() => Math.floor(Math.random() * 36).toString(36))
      .join("");
  }

  getName() {
    return this.agent.name;
  }

  getImage() {
    return this.agent.image;
  }

  private async createOrGetChat() {
    if (this.chatId) return this.chatId;

    // Look for an existing active chat for this user and agent
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('userId', '==', this.userId),
      where('agentInfo.agentId', '==', this.agent.id.toString()),
      where('status', '==', 'active'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // Use existing chat
      this.chatId = snapshot.docs[0].id;
      return this.chatId;
    }

    // Create a new chat
    const newChatRef = doc(collection(db, 'chats'));
    await setDoc(newChatRef, {
      type: 'private',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      agentInfo: {
        agentId: this.agent.id.toString(),
        name: this.agent.name,
        avatarUrl: this.agent.image
      },
      userId: this.userId,
      status: 'active'
    });

    this.chatId = newChatRef.id;
    return this.chatId;
  }

  private async connectToFirebase() {
    // First ensure we have a chat ID
    await this.createOrGetChat();
    
    // Now listen for messages in this chat
    const messagesRef = collection(db, 'chats', this.chatId!, 'messages');
    const q = query(
      messagesRef,
      orderBy('timestamp', 'asc'),
    );

    // Set up real-time listener
    this.unsubscribe = onSnapshot(q, (snapshot) => {
      const newEntries: ChatEntry[] = [];
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data() as FirebaseMessage;
        
        if (data.senderType === 'user') {
          // Add user message
          newEntries.push({
            sender: 'User',
            message: data.text,
            alignment: 'right',
            messageId: doc.id,
            responseToMessageId: data.responseToMessageId,
            isResponseTo: data.isResponseTo
          });
        } else if (data.senderType === 'agent') {
          // Add agent response
          newEntries.push({
            sender: this.agent.name,
            message: data.text,
            alignment: 'left',
            messageId: doc.id,
            responseToMessageId: data.responseToMessageId,
            isResponseTo: data.isResponseTo
          });
        }
      });
      
      // Update chat entries
      this.chatEntries = newEntries;
      
      // Notify subscribers
      this.subscribers.forEach(callback => callback(newEntries));
    }, (error) => {
      console.error("Error listening to messages:", error);
    });
  }

  async getChatEntries(): Promise<ChatEntry[]> {
    return this.chatEntries;
  }

  async sendChatMessage(message: string): Promise<Response> {
    // Ensure we have a chat
    const chatId = await this.createOrGetChat();
    
    // Add user message to Firebase
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const userMessageRef = await addDoc(messagesRef, {
      content: message,
      senderId: this.userId,
      senderType: 'user',
      timestamp: serverTimestamp(),
      status: 'sent',
      responseToMessageId: null, // Initial messages have no parent
      isResponseTo: false // Initial messages are not responses
    });

    // Update the chat's updatedAt timestamp
    await updateDoc(doc(db, 'chats', chatId), {
      updatedAt: serverTimestamp(),
      status: 'queued' // Mark as queued until agent responds
    });
    
    // Simulate agent response after a delay (in a real app, this would be handled by a backend function)
    try {
      // Send to agent and get response
      const response = await fetch(`/api/chats/text`, {
        method: "POST",
        body: JSON.stringify({
          agent: this.agent.id,
          message: message,
          userId: this.userId,
          chatId: chatId
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Agent API returned status ${response.status}`);
      }
      
      const responseData = await response.json();
      const agentResponse = responseData[0]?.text || "Sorry, I couldn't process that.";

      // Add agent response
      await addDoc(messagesRef, {
        content: agentResponse,
        senderId: this.agent.id.toString(),
        senderType: 'agent',
        timestamp: serverTimestamp(),
        status: 'sent',
        responseToMessageId: userMessageRef.id, // Reference to the user message this is responding to
        isResponseTo: true // This is a response message
      });

      // Update chat status back to active
      await updateDoc(doc(db, 'chats', chatId), {
        updatedAt: serverTimestamp(),
        status: 'active'
      });
      
      // Return the actual agent response
      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Return error response
      return new Response(JSON.stringify([{ text: "Error processing your message" }]), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  disconnect() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
} 