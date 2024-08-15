import { useEffect } from "react";
import { UseCities, HasCurrentCity } from "../contexts/CitiesContext";
import styles from "./City.module.css";
import { useParams } from "react-router-dom";
import Spinner from "./Spinner";
import BackButton from "./BackButton";

const formatDate = (date: String) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date(`${date}`));

const flagemojiToPNG = (flag: string) => {
  const countryCode = Array.from(flag)
    .map((char) =>
      String.fromCharCode(char.codePointAt(0)! - 127397).toLowerCase()
    )
    .join("");

  if (!/^[a-zA-Z]+$/.test(countryCode)) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${flag.toLocaleLowerCase()}.png`}
        alt="flag"
      />
    );
  }
  return (
    <img src={`https://flagcdn.com/24x18/${countryCode}.png`} alt="flag" />
  );
};
interface DataCity {
  getCity: (data: number) => void;
  currentCity: HasCurrentCity | null;
  isLoading: boolean;
}

function City() {
  const { getCity, currentCity, isLoading }: DataCity = UseCities();
  const { id } = useParams();
  /*
    note: do not touch or modify this part, 
    because if you change the position useEffect below 
    the code will be always retrigger or re-Run a getcCity Function.
  */
  useEffect(
    function () {
      if (id) {
        getCity(+id);
      }
    },
    //  note: getCity is weird function, cause of infinite loop, so we need [useCallBack] to stop infinite loop function
    [id, getCity]
  );

  if (!currentCity) {
    return <Spinner />;
  }
  const { cityName, emoji, date, notes }: HasCurrentCity = currentCity;
  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className={styles.city}>
      <div className={styles.row}>
        <h6>City name</h6>
        <h3>
          <span>{flagemojiToPNG(`${emoji}`)}</span>{" "}
          {cityName.replace("(the)", "").trim()}
        </h3>
      </div>

      <div className={styles.row}>
        <h6>You went to {cityName} on</h6>
        <p>{formatDate(`${date ?? null}`)}</p>
      </div>

      {notes && (
        <div className={styles.row}>
          <h6>Your notes</h6>
          <p>{notes}</p>
        </div>
      )}

      <div className={styles.row}>
        <h6>Learn more</h6>
        <a
          href={`https://en.wikipedia.org/wiki/${cityName}`}
          target="_blank"
          rel="noreferrer"
        >
          Check out {cityName} on Wikipedia &rarr;
        </a>
      </div>

      <div>
        <BackButton />
      </div>
    </div>
  );
}

export default City;
