import {
  ReactNode,
  Reducer,
  createContext,
  useContext,
  useReducer,
} from "react";

export type HasUser = {
  email: string;
  password: string;
  name?: string;
  avatar?: string;
};

export type HasUserAuth = {
  name: string;
  email: string;
  password: string;
  avatar: string;
};

// action
type HasActionLogin = {
  type: "login";
  payload: HasUser | null;
};

type HasActionLogout = {
  type: "logout";
  payload: HasUser | null;
};

// states
type HasState = {
  user: HasUser | null;
  isAuthenticated: boolean;
};

// IsState
type IsState = HasState;

// actions / many action

type Actions = HasActionLogin | HasActionLogout;

function reducer(state: IsState, action: Actions) {
  switch (action.type) {
    case "login":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    case "logout":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    default:
      throw new Error("Action Unknown!");
  }
}
// initState
const initialState: HasState = {
  user: null,
  isAuthenticated: false,
};

interface HasAuth {
  user: HasUser | null;
  isAuthenticated: boolean;
  login: ({ email, password }: HasUser) => void;
  logout: () => void;
}

const FakeAuthContext = createContext<HasAuth | null>(null);
const FAKE_USER: HasUserAuth = {
  name: "Jack",
  email: "jack@example.com",
  password: "qwerty",
  avatar: "https://i.pravatar.cc/100?u=zz",
};
function FakeAuth({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer<Reducer<IsState, Actions>>(
    reducer,
    initialState
  );

  function login({ email, password }: HasUser) {
    if (email === FAKE_USER.email && password === FAKE_USER.password) {
      dispatch({ type: "login", payload: FAKE_USER });
    }
  }

  function logout() {
    dispatch({ type: "logout", payload: FAKE_USER });
  }
  return (
    <FakeAuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        login: login,
        logout: logout,
      }}
    >
      {children}
    </FakeAuthContext.Provider>
  );
}

function FakeUseContext() {
  const context = useContext(FakeAuthContext);
  if (context === null) {
    throw new Error(
      `[Developer mode]: In the App.tsx only applied this context API 'FakeAuth'`
    );
  }
  return context;
}

export { FakeAuth, FakeUseContext };
