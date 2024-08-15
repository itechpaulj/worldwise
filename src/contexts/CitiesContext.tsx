import {
  createContext,
  useEffect,
  ReactNode,
  useContext,
  useReducer,
  Reducer,
  useCallback,
} from "react";

const BASE_URL: string = import.meta.env.VITE_APP_URL;
export interface HasPromise {
  id: number;
  cityName: string;
  country: string;
  emoji: string;
  date: string;
  notes: string;
  position: {
    lat: number;
    lng: number;
  };
}
// current city
export interface HasCurrentCity {
  id?: number;
  cityName: String;
  emoji: String;
  date: String;
  notes: String;
}

export interface HasCitiesContext {
  cities: HasPromise | null;
  isLoading: boolean;
  getCity: (data: number) => void;
  currentCity: HasCurrentCity | null;
  addNewCityForm: (data: HasPromise | null) => void;
  DeleteCity: (data: number) => void;
}

const CityContext = createContext<HasCitiesContext | null>(null);

interface FuncCityContext {
  children: ReactNode;
}

// take a convert a useReducer
// action
type ActionLoading = {
  type: "loading";
  payload: boolean;
};

type ActionCities = {
  type: "citiesLoaded";
  payload: HasPromise | null;
};

type ActionCurrentCity = {
  type: "currentCity";
  payload: HasPromise | null;
};

// state
type ReducerCityContext = {
  isLoading: boolean;
  cities: HasPromise | null;
  currentCity: HasCurrentCity | null;
};

// actions and IsState
type Actions = ActionLoading | ActionCities | ActionCurrentCity;

type IsState = ReducerCityContext;

function reducer(state: IsState, action: Actions) {
  switch (action.type) {
    case "loading":
      return {
        ...state,
        isLoading: action.payload, // true or false [note: validity is boolean only]
      };
    case "citiesLoaded":
      return {
        ...state,
        cities: action.payload, // true or false return array[]
      };
    case "currentCity":
      return {
        ...state,
        currentCity: action.payload,
      };
    default:
      throw new Error("Action Unknowm");
  }
}

function CitiesContext({ children }: FuncCityContext) {
  //@ts-expect-error
  let controller;

  const initialState: ReducerCityContext = {
    isLoading: false,
    cities: null,
    currentCity: null,
  };

  const [state, dispatch] = useReducer<Reducer<IsState, Actions>>(
    reducer,
    initialState
  );

  // this fetch API, just a regular JS API
  // get all data
  function fetchCities<T>(url: T) {
    return new Promise((resolve) => {
      controller = new AbortController();
      dispatch({ type: "loading", payload: true });

      setTimeout(() => {
        //@ts-expect-error
        resolve(fetch(`${url}`, { signal: controller.signal }));
      }, 3000);
    });
  }

  // get the current city
  const getCity = useCallback(async function getCity(id: number) {
    fetchCities<string>(`${BASE_URL}/cities/${id}`)
      .then((response) => {
        dispatch({ type: "loading", payload: true });
        try {
          if (response instanceof Response) {
            if (!response.ok) {
              throw new Error(
                `Status Code: ${response.status}, Response: ${response.statusText}`
              );
            }
            return response.json();
          }
        } catch (err) {
          throw new Error(
            `Fetch: ${err instanceof Error ? err.message : "Unknown Action"}`
          );
        }
      })
      .then((data) => {
        dispatch({ type: "loading", payload: false });
        dispatch({ type: "currentCity", payload: data });
      })
      .catch((err) => {
        if (err instanceof Error) {
          if (err.name !== "AbortError") {
            throw new Error(`${err.message}`);
          }
        }
      });
  }, []);

  async function addNewCityForm(newCity: HasPromise | null) {
    try {
      // note: we need create new fetch api
      controller = new AbortController();

      const response = await fetch(`${BASE_URL}/cities`, {
        signal: controller.signal,
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(
          `Status Code: ${response.status}, Response: ${response.statusText}`
        );
      }
      const data = await response.json();

      state && state.cities instanceof Array && state.cities.push(data);
      dispatch({ type: "currentCity", payload: data });
      dispatch({ type: "loading", payload: false });

      return data as HasPromise;
    } catch (err) {
      if (err instanceof Error) {
        if (err.name !== "AbortError") {
          console.error(err);
          throw new Error(`${err.message}`);
        }
      }
    }
  }

  // delete City
  async function DeleteCity(id: number) {
    try {
      controller = new AbortController();
      const response = await fetch(`${BASE_URL}/cities/${id}`, {
        signal: controller.signal,
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(
          `Status Code: ${response.status}, Response: ${response.statusText}`
        );
      }
      //@ts-ignore
      state.cities =
        state &&
        state.cities instanceof Array &&
        state.cities.filter((city) => city.id !== id);
      dispatch({ type: "loading", payload: false });
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(
          `There was a problem for delete button. ErrorMessage: ${err.message}`
        );
      }
    }
  }

  useEffect(function () {
    fetchCities<string>(`${BASE_URL}/cities`)
      .then((response) => {
        dispatch({ type: "loading", payload: true });
        try {
          if (response instanceof Response) {
            if (!response.ok) {
              throw new Error(
                `Status Code: ${response.status}, Response: ${response.statusText}`
              );
            }
            return response.json();
          }
        } catch (err) {
          throw new Error(
            `Fetch: ${err instanceof Error ? err.message : "Unknown Action"}`
          );
        }
      })
      .then((data) => {
        dispatch({ type: "citiesLoaded", payload: data });
        dispatch({ type: "loading", payload: false });
      })
      .catch((err) => {
        if (err instanceof Error) {
          if (err.name !== "AbortError") {
            console.error(err);
            throw new Error(`${err.message}`);
          }
        }
      });

    if (state.currentCity) {
      //@ts-expect-error
      const validId = state.currentCity && +state.currentCity?.id;
      getCity(validId || 0);
    }
  }, []);

  return (
    <CityContext.Provider
      value={{
        cities: state.cities,
        isLoading: state.isLoading,
        getCity: getCity, // function
        currentCity: state.currentCity,
        addNewCityForm: addNewCityForm, // async function
        DeleteCity: DeleteCity, // function
      }}
    >
      {children}
    </CityContext.Provider>
  );
}

function UseCities() {
  const context = useContext(CityContext);
  if (context === null) {
    throw new Error(
      `[Developer mode]: In the App.tsx only applied this context API 'CitiesContext'`
    );
  }
  return context;
}

export { CitiesContext, UseCities };
