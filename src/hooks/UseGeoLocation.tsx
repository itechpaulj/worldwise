import { useState } from "react";

export interface HasUseLocation {
  latitude: number;
  longitude: number;
}

function UseGeoLocation(defaultLocation = null) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [position, setPosition] = useState<HasUseLocation | null>(
    defaultLocation
  );
  const [error, setError] = useState<string>("");

  function getPosition() {
    if (!navigator.geolocation) {
      return setError("Your browser does not support geolocation");
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos: GeolocationPosition) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setIsLoading(false);
      },
      (error: GeolocationPositionError) => {
        if (error instanceof Error) {
          setError(`${error.message}`);
          setIsLoading(false);
        }
      }
    );
  }

  return { isLoading, position, error, getPosition };
}

export { UseGeoLocation };
