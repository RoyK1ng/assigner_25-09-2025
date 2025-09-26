import React, { createContext, useState, ReactNode, useContext } from 'react';
import { Case, User } from '../types';
// Define el tipo para el contexto
type UserContextType = {
  userType: string | null;
  setUserType: (userType: string | null) => void;
  users: User[];
  cases: Case[];
  setCases: (cases: Case[]) => void;
  setUsers: (users: User[]) => void;
  casesPerMonth: { [userId: string]: number };
  setCasesPerMonth: (casesPerMonth: { [userId: string]: number }) => void;
};

// Crea el contexto con un valor inicial
export const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

// Define el tipo para las props del proveedor
type UserProviderProps = {
  children: ReactNode;
};

// Crea el proveedor del contexto
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userType, setUserType] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [casesPerMonth, setCasesPerMonth] = useState<{ [userId: string]: number }>({});

  return (
    <UserContext.Provider value={{ userType, setUserType, users, setUsers, casesPerMonth, setCasesPerMonth,cases, setCases }}>
      {children}
    </UserContext.Provider>
  );
};