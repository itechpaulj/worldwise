import styles from "./CityItem.module.css";
import { Link, useNavigate } from "react-router-dom";
import {
  UseCities,
  HasPromise,
  HasCurrentCity,
} from "../contexts/CitiesContext";
import { MouseEvent } from "react";

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date(`${date}`));
};

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

interface FuncCityItem {
  city: HasPromise | null;
}

interface HasSelectedCity {
  id?: number | string;
  emoji: string;
  cityName: string;
  date: string;
  position: {
    lat: number;
    lng: number;
  };
}

function CityItem({ city }: FuncCityItem) {
  const navigate = useNavigate();
  const context = UseCities();
  if (!context) return <></>;
  const {
    currentCity,
    DeleteCity,
  }: {
    currentCity: HasCurrentCity | null;
    DeleteCity: (data: number) => void;
  } = context;

  if (!city) return <></>;
  const { emoji, cityName, date, position, id }: HasSelectedCity = city;
  async function handleDelBtn(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    await DeleteCity(id ? +id : +!id);
    navigate("/app/cities");
  }

  return (
    <>
      <li key={id}>
        <Link
          className={`${styles.cityItem} ${currentCity?.id === id ? styles["cityItem--active"] : ""}`}
          to={`${city.id}?lat=${position.lat}&lng=${position.lng}`}
        >
          <span className={styles.emoji}>{flagemojiToPNG(`${emoji}`)}</span>
          <h3 className={styles.name}>
            {cityName.replace("(the)", "").trim()}
          </h3>
          <time className={styles.date}>{formatDate(`${date}`)}</time>
          <button className={styles.deleteBtn} onClick={handleDelBtn}>
            &times;
          </button>
        </Link>
      </li>
    </>
  );
}

export default CityItem;
