import { db } from '@/app/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface AgentStats {
  subscriberCount: number;
  messageCount: number;
  messageHistory: { date: string; count: number }[];
  lastUpdated: Date;
}

export function useAgentStats(agentIdName: string) {
  const [stats, setStats] = useState<AgentStats>({
    subscriberCount: 0,
    messageCount: 0,
    messageHistory: [],
    lastUpdated: new Date()
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'agentStats', agentIdName),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setStats({
            ...data,
            lastUpdated: data.lastUpdated.toDate()
          } as AgentStats);
        }
      }
    );

    return () => unsubscribe();
  }, [agentIdName]);

  return stats;
}