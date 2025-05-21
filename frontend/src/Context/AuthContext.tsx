import React, {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

interface IAuthContext {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider: React.FC<{ children: any }> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <AuthContext.Provider value={{ loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
