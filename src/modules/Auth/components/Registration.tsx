import React from "react";
import { TextField, InputAdornment, IconButton, Button } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../redux/store";
import { setIsAuthenticated, setUsername } from "../store/reducer/authUser";

import styles from "./Auth/Auth.module.scss";

export const Registration: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = React.useState(false);
  const [passwordMatch, setPasswordMatch] = React.useState(true);

  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const password = watch("password");
  const passwordConfirmation = watch("passwordConfirmation");

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  React.useEffect(() => {
    setPasswordMatch(password === passwordConfirmation);
  }, [password, passwordConfirmation]);

  type Content = {
    token: string;
    data: { email: string; password: string; fullName: string; id: number };
  };

  const registrationUser = async (data: any) => {
    const res = await fetch("https://501881a3cd249a1b.mokky.dev/register", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        fullName: data.name,
      }),
    });
    if (res.ok) {
      //console.log(res);
      const content: Content = await res.json();
      localStorage.setItem("token", content.token);
      dispatch(setIsAuthenticated(true));
      dispatch(setUsername(content.data.fullName));
      navigate("/");
      //console.log(content); // { "token": "1hquwp1...", "data": { ... } }
    } else {
      alert("Эта почта уже используется :(");
    }
  };

  return (
    <form onSubmit={handleSubmit(registrationUser)}>
      <div>
        <TextField
          className={styles.text_field}
          label="Полное Имя"
          variant="standard"
          {...register("name", { required: true })}
        />
      </div>
      <div>
        <TextField
          className={styles.text_field}
          label="Почта"
          variant="standard"
          {...register("email", { required: true })}
        />
      </div>
      <div>
        <TextField
          className={styles.text_field}
          label="Пароль"
          variant="standard"
          type={showPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClickShowPassword}>
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          {...register("password", { required: true, minLength: 6 })}
        />

        {errors.password && errors.password.type === "minLength" && (
          <h5 style={{ color: "red" }}>
            Минимальная длина пароля - 6 символов
          </h5>
        )}
      </div>
      <div>
        <TextField
          className={styles.text_field}
          label="Повторите пароль"
          variant="standard"
          type={showPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClickShowPassword}>
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          {...register("passwordConfirmation", { required: true })}
        />
      </div>
      {!passwordMatch && <h5 style={{ color: "red" }}>Пароли не совпадают</h5>}
      <div className={styles.button_container}>
        <Button
          className={styles.button_confirm}
          variant="contained"
          type="submit"
          disabled={
            !passwordMatch ||
            (errors.password && errors.password.type === "minLength") ||
            watch("name") === "" ||
            watch("password") === ""
          }
        >
          Зарегистироваться
        </Button>
      </div>
    </form>
  );
};
