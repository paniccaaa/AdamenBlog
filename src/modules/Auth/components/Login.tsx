import React from "react";
import { TextField, InputAdornment, IconButton, Button } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import styles from "./Auth/Auth.module.scss";
import { useNavigate } from "react-router-dom";
import { handleMouseDownPassword } from "../helpers/handleMouseDownPassword";
import {
  setEmail,
  setIsAuthenticated,
  setUsername,
} from "../store/reducer/authUser";
import { useAppDispatch } from "../../../redux/store";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const loginUser = async (data: any) => {
    const res = await fetch("https://501881a3cd249a1b.mokky.dev/auth", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    if (res.ok) {
      //console.log(res);
      const content = await res.json();
      localStorage.setItem("token", content.token);
      dispatch(setIsAuthenticated(true));
      dispatch(setUsername(content.data.fullName)); // сохраняем имя пользователя <___________
      dispatch(setEmail(content.data.email));
      //console.log(content); // { "token": "1hquwp1...", "data": { ... } }
      navigate("/");
    } else {
      alert("Этот пользователь не авторизован :(");
    }
  };

  return (
    <form onSubmit={handleSubmit(loginUser)}>
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
                <IconButton
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          {...register("password", { required: true, minLength: 6 })}
        />
      </div>
      {errors.password && errors.password.type === "minLength" && (
        <h5 style={{ color: "red" }}>Минимальная длина пароля - 6 символов</h5>
      )}
      <div className={styles.button_container}>
        <Button
          className={styles.button_confirm}
          variant="contained"
          type="submit"
          disabled={watch("email") === "" || watch("password") === ""}
        >
          Войти
        </Button>
      </div>
    </form>
  );
};
