import { useNavigate } from "react-router-dom";
import styles from "./Map.module.css";
import { useEffect, useState } from "react";
import Button from "./Button";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import {
  UseCities,
  HasCurrentCity,
  HasPromise,
} from "../contexts/CitiesContext";
import { UseGeoLocation } from "../hooks/UseGeoLocation";
import { UseUrlPosition } from "../hooks/UseUrlPosition";

const ISZOOM: number = 8;
type HasMapPosition = [number, number];

interface HasCurrCity {
  currentCity: HasCurrentCity | null;
  cities: HasPromise | null;
  isLoading: boolean;
}

const flagemojiToPNG = (flag: string) => {
  const countryCode = Array.from(flag)
    .map((char) =>
      String.fromCharCode(char.codePointAt(0)! - 127397).toLowerCase()
    )
    .join("");
  return (
    <img src={`https://flagcdn.com/24x18/${countryCode}.png`} alt="flag" />
  );
};

function Map() {
  const context = UseCities();
  const [mapPosition, setMapPosition] = useState<HasMapPosition>([0, 0]);
  const [mapLat, mapLng] = UseUrlPosition();

  const { cities }: HasCurrCity = context;

  const {
    isLoading: isLoadingPosition,
    position: geoLocationPosition,
    getPosition,
  } = UseGeoLocation();

  useEffect(
    function () {
      if (geoLocationPosition) {
        setMapPosition([
          geoLocationPosition.latitude,
          geoLocationPosition.longitude,
        ]);
      }
    },
    [geoLocationPosition]
  );
  useEffect(
    function () {
      if (mapLat && mapLng) {
        <ClickMapPinLocation position={[+mapLat, +mapLng]} />;
        setMapPosition([+mapLat, +mapLng]);
      }
    },
    [mapLat, mapLng]
  );

  return (
    <div className={styles.mapContainer}>
      <Button type="position" onClick={getPosition}>
        {isLoadingPosition ? "Loading..." : "Use your location."}
      </Button>
      <MapContainer
        center={mapPosition}
        zoom={ISZOOM}
        scrollWheelZoom={true}
        className={styles.map}
        zoomAnimation={true}
        zoomSnap={0.1}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {cities instanceof Array &&
          cities.map((city: HasPromise) => {
            let getid = `${crypto.randomUUID()}-${Date.now()}`;
            return <MapLoad key={getid} city={city} />;
          })}
        {mapLat && mapLng && (
          <ClickMapPinLocation position={[+mapLat, +mapLng]} />
        )}
        {geoLocationPosition && (
          <MyLocation
            position={mapPosition}
            geoLocationPosition={geoLocationPosition}
          />
        )}
        <ClickEventMap />;
        <NoRepeatMap />
      </MapContainer>
    </div>
  );
}

function MapLoad({ city }: { city: HasPromise }) {
  return (
    <Marker position={[city.position.lat, city.position.lng]}>
      <Popup>
        <span>{flagemojiToPNG(city.emoji)}</span>
        <span>{city.cityName !== "" ? city.cityName : "No description"}</span>
      </Popup>
    </Marker>
  );
}

function ClickMapPinLocation({ position }: { position: [number, number] }) {
  const map = useMap();
  map.flyTo(position, ISZOOM, {
    animate: true,
    duration: 2, // Adjust the duration to your preference
  });
  return null;
}

function MyLocation({
  position,
  geoLocationPosition,
}: {
  position: [number, number];
  geoLocationPosition: {
    latitude: number;
    longitude: number;
  };
}) {
  const map = useMap();
  map.flyTo(position, ISZOOM, {
    animate: true,
    duration: 2, // Adjust the duration to your preference
  });

  const pinMyLocationLat = position instanceof Array && position.at(0);
  const pinMyLocationLng = position instanceof Array && position.at(1);

  const myHomeLocationLat = geoLocationPosition && geoLocationPosition.latitude;
  const myHomeLocationLng =
    geoLocationPosition && geoLocationPosition.longitude;

  const myHomeOnlyPinLocation =
    pinMyLocationLat === myHomeLocationLat &&
    pinMyLocationLng === myHomeLocationLng;

  return (
    <>
      {!myHomeOnlyPinLocation ? (
        <></>
      ) : (
        position instanceof Array && (
          <Marker position={position}>
            <Popup>
              <span>You are Here.</span>
            </Popup>
          </Marker>
        )
      )}
    </>
  );
}

function ClickEventMap() {
  const navigate = useNavigate();

  useMapEvents({
    click: (e) => navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`),
  });
  return null;
}

function NoRepeatMap() {
  const map = useMap();
  const southWest = L.latLng(-89.98155760646617, -180),
    northEast = L.latLng(89.99346179538875, 180);
  const bounds = L.latLngBounds(southWest, northEast);

  map.setMaxBounds(bounds);
  map.on("drag", function () {
    map.panInsideBounds(bounds, { animate: false });
  });

  return null;
}

export default Map;
