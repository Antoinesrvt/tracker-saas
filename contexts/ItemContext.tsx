'use client';

import React, { createContext, useContext, useState } from 'react';

type ItemContextType = {
  selectedWorkspaceId: string | null;
  setSelectedWorkspaceId: (id: string | null) => void;
  selectedGoalId: string | null;
  setSelectedGoalId: (id: string | null) => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  openGoalModal: (goalId: string) => void;
};

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGoalId(null);
  };

  const openGoalModal = (goalId: string) => {
    setSelectedGoalId(goalId);
    setIsModalOpen(true);
  };

  return (
    <ItemContext.Provider
      value={{
        selectedWorkspaceId,
        setSelectedWorkspaceId,
        selectedGoalId,
        setSelectedGoalId,
        isModalOpen,
        openModal,
        closeModal,
        openGoalModal
      }}
    >
      {children}
    </ItemContext.Provider>
  );
};

export const useItemContext = () => {
  const context = useContext(ItemContext);
  if (context === undefined) {
    throw new Error('useItemContext must be used within an ItemProvider');
  }
  return context;
}; 