// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"
import { useEffect, useState, FormEvent } from "react";
import styles from "./Form.module.css";
import Button from "./Button";
import BackButton from "./BackButton";
import { UseUrlPosition } from "../hooks/UseUrlPosition";
import Message from "./Message";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.min.css";
import { HasPromise, UseCities } from "../contexts/CitiesContext";
import { useNavigate } from "react-router-dom";

function useFlagEmojiToPNG(flag: string) {
  flag = flag.toLowerCase();
  if (!/^[a-zA-Z]+$/.test(flag)) {
    flag = Array.from(flag, (codeUnit: string) =>
      String.fromCharCode((codeUnit.codePointAt(0) ?? 0) - 127397).toLowerCase()
    ).join("");
  }
  return <img src={`https://flagcdn.com/24x18/${flag}.png`} alt="flag" />;
}

const BASE_URL: string =
  "https://api.bigdatacloud.net/data/reverse-geocode-client";

interface HasFormClickMap {
  countryCode?: string;
  locality?: string;
  city?: string;
  countryName?: string;
  emoji?: string;
}
function Form() {
  // form input State
  const [cityName, setCityName] = useState<HasFormClickMap | null | string>("");
  const [country, setCountry] = useState<HasFormClickMap | null | string>(null);
  const [date, setDate] = useState<Date | null>(new Date());
  const [notes, setNotes] = useState<string>("");

  // fetch api reverse GEOCODING
  const [mapLat, mapLng] = UseUrlPosition(); // custom hooks
  const [errorGeocoding, setErrorGeocoding] = useState<null | string>(null);
  const [emoji, setEmoji] = useState<string | null>(null);

  // custom context api hooks
  const context = UseCities();
  const navigate = useNavigate();

  useEffect(
    function () {
      if (!mapLat && !mapLng) return;
      async function fetchCityMap() {
        try {
          setErrorGeocoding(null);
          const response = await fetch(
            `${BASE_URL}?latitude=${mapLat}&longitude=${mapLng}`
          );

          if (!response.ok) {
            const responseFault = await fetch(`${response.url}`);
            const dataFault = await responseFault.json();
            let messageFault;
            messageFault =
              response.status === 400 &&
              `Status: ${response.status}, Bad Request`;
            if (response.status === 400) {
              messageFault = dataFault.status === 401 && dataFault.description;
            }

            throw new Error(`${messageFault}`);
          }

          let data = await response.json();

          if (
            (data && data.countryName === "") ||
            data.locality.startsWith("Etc")
          ) {
            setErrorGeocoding(
              "There does not a city, you just click in the ocean. Click only the land or map only 😉"
            );
            throw new Error(
              `There does not a city, you just click in the ocean. Click only the land or map only 😉`
            );
          }

          setCityName(data.city || data.locality || "");
          setCountry(data.countryName || "");
          setEmoji(`${data.countryCode}`);

          return data;
        } catch (err) {
          if (err instanceof Error) {
            setErrorGeocoding(`${err.message}`);
            throw new Error(
              `${err instanceof Error ? err.message : "Action Unknown!"}`
            );
          }
        }
      }
      fetchCityMap();
    },
    [mapLat, mapLng]
  );
  if (!mapLat && !mapLng) {
    return <Message message="Stary by clicking, somewhere in the map" />;
  }

  if (errorGeocoding) {
    return <Message message={errorGeocoding} />;
  }

  interface MyElemForm extends HTMLFormControlsCollection {
    cityName: HTMLInputElement;
    date: HTMLInputElement;
    notes: HTMLInputElement;
  }

  interface FormValidSubmit extends HTMLFormElement {
    readonly elements: MyElemForm;
  }

  interface HasAddNewCity {
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
  interface HasAddCitySubmitForm {
    isLoading: boolean;
    addNewCityForm: (data: HasPromise | null) => void;
  }
  const { addNewCityForm, isLoading }: HasAddCitySubmitForm = context;

  function parseDateString(dateStr: string) {
    const currentDateTime = new Date();
    // Split the input date string into parts
    const [day, month, year] = dateStr.split("/").map(Number);

    // Adjust the year to four digits
    const fullYear = year < 100 ? 2000 + year : year;
    const validDate = new Date(fullYear, month - 1, day);
    // Create a new Date object using individual components
    validDate.setUTCHours(
      currentDateTime.getUTCHours(),
      currentDateTime.getUTCMinutes(),
      currentDateTime.getUTCSeconds(),
      currentDateTime.getUTCMilliseconds()
    );
    return validDate.toISOString();
  }

  async function handleSubmit(e: FormEvent<FormValidSubmit>) {
    e.preventDefault();

    const target = e.currentTarget.elements;

    const cityName = target.cityName.value;
    const date = target.date.value;
    const notes = target.notes.value;
    if (!cityName || !date) return null;

    const isLat = !mapLat ? +!mapLat : +mapLat;
    const isLng = !mapLng ? +!mapLng : +mapLng;
    const newCity: HasAddNewCity = {
      id: +Date.now(),
      cityName: cityName,
      country: `${country}`,
      emoji: `${emoji}`,
      date: `${parseDateString(date)}`,
      notes: `${notes}`,
      position: {
        lat: isLat,
        lng: isLng,
      },
    };
    await addNewCityForm(newCity);
    navigate("/app/cities");
  }

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={`${cityName}`}
        />
        <span className={styles.flag}>{useFlagEmojiToPNG(`${emoji}`)}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {`${cityName}`}?</label>
        <DatePicker
          id="date"
          selected={date}
          onChange={(date: Date) => setDate(date)}
          dateFormat={"dd/MM/yy"}
        />
        {/* <input
          id="date"
          onChange={(e) => setDate(e.target.value)}
          value={`${date}`}
        /> */}
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {`${cityName}`}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
