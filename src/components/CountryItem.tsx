import styles from "./CountryItem.module.css";

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
function CountryItem({
  country,
}: {
  country: {
    country: String;
    emoji: String;
  };
}) {
  return (
    <li className={styles.countryItem}>
      <span>{flagemojiToPNG(`${country.emoji}`)}</span>
      <span>{country.country.replace("(the)", "").trim()}</span>
    </li>
  );
}

export default CountryItem;
