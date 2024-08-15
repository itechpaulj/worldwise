import styles from "./CountryList.module.css";
import CountryItem from "./CountryItem";
import Spinner from "./Spinner";
import Message from "./Message";
import { UseCities, HasPromise } from "../contexts/CitiesContext";

interface HasCountryLists {
  cities: HasPromise | null;
  isLoading: boolean;
}

function CountryList() {
  const context = UseCities();
  if (!context) return <></>;
  const { cities, isLoading }: HasCountryLists = context;

  if (cities instanceof Array && !cities.length)
    return (
      <>
        <Message message="Add your city, by clicking on a city on the map." />
      </>
    );
  if (isLoading)
    return (
      <>
        <Spinner />
      </>
    );

  const countries =
    (cities instanceof Array &&
      cities.reduce((acc: unknown, curr: HasPromise) => {
        if (acc instanceof Array) {
          if (
            !acc
              .map((el: HasPromise) => `${el.country}`)
              .includes(`${curr.country}`)
          )
            return [...acc, { country: curr.country, emoji: curr.emoji }];
          else return [...acc];
        }
      }, [])) ||
    [];

  return (
    <ul className={styles.countryList}>
      {countries instanceof Array &&
        countries.map((country: HasPromise) => (
          <CountryItem country={country} key={`${country.country}`} />
        ))}
    </ul>
  );
}

export default CountryList;
