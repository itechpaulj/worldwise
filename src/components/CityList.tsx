import styles from "./CityList.module.css";
import CityItem from "./CityItem";
import Spinner from "./Spinner";
import Message from "./Message";
import { UseCities, HasPromise } from "../contexts/CitiesContext";

interface HasCityLists {
  cities: HasPromise | null;
  isLoading: boolean;
}

function CityList() {
  const context = UseCities();
  if (!context) return <></>;

  const { cities, isLoading }: HasCityLists = context;

  if (isLoading) {
    return (
      <>
        <Spinner />
      </>
    );
  }
  if (!cities) {
    return (
      <>
        <Message message="Pleast Wait... 😉" />
      </>
    );
  }
  if (cities instanceof Array && !cities.length) {
    return (
      <>
        <Message message="Add your city, by clicking on a city on the map." />
      </>
    );
  }

  return (
    <ul className={styles.cityList}>
      {cities instanceof Array &&
        cities.map((city) => {
          let getID = `${crypto.randomUUID()}-${Date.now()}`;
          return <CityItem city={city} key={getID} />;
        })}
    </ul>
  );
}

export default CityList;
