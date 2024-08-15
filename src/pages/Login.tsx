import { FormEvent, useEffect, useState } from "react";
import styles from "./Login.module.css";
import PageNav from "../components/PageNav";
import { FakeUseContext } from "../contexts/FakeAuth";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

interface HasLoginFormElem extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
}

interface HasSubmitElements extends HTMLFormElement {
  readonly elements: HasLoginFormElem;
}

export default function Login() {
  const navigate = useNavigate();
  // PRE-FILL FOR DEV PURPOSES
  const [email, setEmail] = useState<string>("jack@example.com");
  const [password, setPassword] = useState<string>("qwerty");

  const context = FakeUseContext();

  if (!context) {
    throw new Error(`There was a problem in the FakeAuth Context Api.`);
  }

  const { login, isAuthenticated } = context;

  function handleSubmit(e: FormEvent<HasSubmitElements>) {
    e.preventDefault();

    const target = e.currentTarget.elements;

    const email = target.email.value;
    const password = target.password.value;

    if (!email && !password) return;

    login({ email, password });
  }

  useEffect(
    function () {
      if (isAuthenticated) navigate("/app", { replace: true });
    },
    [isAuthenticated, navigate]
  );

  return (
    <main className={styles.login}>
      <PageNav />
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            value={`${email}`}
          />
        </div>

        <div className={styles.row}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            value={`${password}`}
          />
        </div>

        <div>
          <Button type="primary">Login</Button>
        </div>
      </form>
    </main>
  );
}
