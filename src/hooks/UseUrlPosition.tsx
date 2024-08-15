import { useSearchParams } from "react-router-dom";

function UseUrlPosition() {
  const [urlParams] = useSearchParams();
  let Lat = urlParams.get("lat");
  let Lng = urlParams.get("lng");
  return [Lat, Lng];
}

export { UseUrlPosition };
