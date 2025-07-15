import React, { useState, useEffect } from 'react';
import { Select, Input } from 'rizzui';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/utils/firestore/db';

export default function TicketFilters() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [ticketId, setTicketId] = useState('');

  useEffect(() => {
    const fetchAgents = async () => {
      const agentsQuery = query(
        collection(db, 'agents')
      );
      const unsubscribe = onSnapshot(agentsQuery, (querySnapshot) => {
        const agentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAgents(agentsData);
      });

      return () => {
        unsubscribe();
      };
    };

    fetchAgents();
  }, []);

  const handleAgentChange = (selected) => {
    setSelectedAgent(selected);
    // Add your logic to filter messages by agent
  };

  const handleTicketIdChange = (event) => {
    setTicketId(event.target.value);
    // Add your logic to filter messages by ticket ID
  };

  return (
    <div className="my-4 flex gap-4">
      <Input
        type="text"
        value={ticketId}
        onChange={handleTicketIdChange}
        placeholder="Filter by Ticket ID"
      />
      <Select
        options={agents.map((agent) => ({
          value: agent.id,
          label: agent.nck,
        }))}
        value={selectedAgent}
        onChange={handleAgentChange}
        placeholder="Select Agent"
      />
    </div>
  );
}
