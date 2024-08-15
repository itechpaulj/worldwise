import Sidebar from "../components/Sidebar";
import Map from "../components/Map";
import styles from "./AppLayout.module.css";
import User from "../components/User";
import { FakeUseContext } from "../contexts/FakeAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function AppLayout() {
  const context = FakeUseContext();
  const navigate = useNavigate();
  if (!context.user) return <></>;
  const { user, isAuthenticated } = context;
  useEffect(function () {
    if (!user && !isAuthenticated) navigate("/");
  }, []);
  return (
    <div className={styles.app}>
      <Sidebar />
      <Map />
      <User />
    </div>
  );
}

export default AppLayout;
