import {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useContext,
} from "react";

const BASE_URL: string = "http://localhost:8000";

export interface HasPromise {
  id?: number | string;
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
  id?: number | string;
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

function CitiesContext({ children }: FuncCityContext) {
  const [cities, setCities] = useState<HasPromise | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentCity, setCurrentCity] = useState<HasCurrentCity | null>(null);
  //@ts-expect-error
  let controller;

  // this fetch API, just a regular JS API

  // get all data
  function fetchCities<T>(url: T) {
    return new Promise((resolve) => {
      controller = new AbortController();
      setIsLoading(true);
      setTimeout(() => {
        //@ts-expect-error
        resolve(fetch(`${url}`, { signal: controller.signal }));
      }, 3000);
    });
  }

  // get the current city
  async function getCity(id: number) {
    fetchCities<string>(`${BASE_URL}/cities/${id}`)
      .then((response) => {
        setIsLoading(true);
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
        setCurrentCity(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err instanceof Error) {
          if (err.name !== "AbortError") {
            throw new Error(`${err.message}`);
          }
        }
      });
  }

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
      let hasModifyData: HasPromise = {
        id: `${data.id}`,
        cityName: data.cityName,
        country: `${data.country}`,
        emoji: `${data.emoji}`,
        date: `${data.date}`,
        notes: `${data.notes}`,
        position: {
          lat: data.position.lat,
          lng: data.position.lng,
        },
      };
      //@ts-expect-error
      setCities((cities) => [...cities, hasModifyData]);
      setTimeout(() => setIsLoading(false), 2000);
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

      setCities((cities: HasPromise | null) => {
        let hasCity = cities && cities instanceof Array;
        if (hasCity) {
          //@ts-expect-error
          return cities ? cities.filter((city) => city.id !== id) : cities;
        }
        return cities;
      });
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
        setIsLoading(true);
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
        setCities(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err instanceof Error) {
          if (err.name !== "AbortError") {
            console.error(err);
            throw new Error(`${err.message}`);
          }
        }
      });

    if (currentCity) {
      //@ts-expect-error
      const validId = currentCity && +currentCity?.id;
      getCity(validId || 0);
    }
  }, []);

  return (
    <CityContext.Provider
      value={{
        cities: cities,
        isLoading: isLoading,
        getCity: getCity,
        currentCity: currentCity,
        addNewCityForm: addNewCityForm,
        DeleteCity: DeleteCity,
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
