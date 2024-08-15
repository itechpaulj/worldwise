import { ReactNode, useEffect } from "react";
import { FakeUseContext } from "../contexts/FakeAuth";
import { useNavigate } from "react-router-dom";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const context = FakeUseContext();
  const navigate = useNavigate();

  const { isAuthenticated } = context;

  useEffect(
    function () {
      if (!isAuthenticated) navigate("/");
    },
    [isAuthenticated]
  );

  return <>{isAuthenticated ? children : null}</>;
}

export default ProtectedRoute;
