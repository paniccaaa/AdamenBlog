import React from "react";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";

import styles from "./Auth.module.scss";
import { Login } from "../Login";
import { Registration } from "../Registration";

export const AuthUser: React.FC = () => {
  const [alignment, setAlignment] = React.useState("login");

  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newAlignment: string
  ) => {
    setAlignment(newAlignment);
  };

  return (
    <div className={styles.auth_container}>
      <h2 className={styles.title}>Авторизация</h2>
      <ToggleButtonGroup
        color="primary"
        value={alignment}
        exclusive
        onChange={handleChange}
        aria-label="Platform"
      >
        <ToggleButton value="login">Вход</ToggleButton>
        <ToggleButton value="registration">Регистрация</ToggleButton>
      </ToggleButtonGroup>

      {alignment === "login" ? <Login /> : <Registration />}
    </div>
  );
};
