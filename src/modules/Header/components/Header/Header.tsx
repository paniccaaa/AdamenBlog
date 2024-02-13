import { Link, useNavigate } from "react-router-dom";
import {
  selectAuth,
  setIsAuthenticated,
} from "../../../Auth/store/reducer/authUser";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import React from "react";
import { fetchDataUser } from "../../helpers/fetchDataUser";
import styles from "./Header.module.scss";
import { useAppDispatch } from "../../../../redux/store";
import { useSelector } from "react-redux";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const modalRef = React.useRef<HTMLDivElement>(null);

  const { isAuthenticated, username, email } = useSelector(selectAuth);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      dispatch(setIsAuthenticated(false));
      setIsModalOpen(false);
      navigate("/auth");
    } else {
      setIsModalOpen(false);
    }
  };

  const accessToken = localStorage.getItem("token");

  React.useEffect(() => {
    fetchDataUser(accessToken, dispatch);
  }, []);

  return (
    <div className={styles.header_container}>
      <div className={styles.button_container}>
        <Link to="/">
          <h1 className={styles.title}>Adamen Blog</h1>
        </Link>
      </div>

      <div className={styles.button_container}>
        <Link to="/">
          <button className={styles.nav}>Главная</button>
        </Link>

        <Link to="/contacts">
          <button className={styles.nav}>Контакты</button>
        </Link>

        {!isAuthenticated && (
          <Link to="/auth">
            <button className={styles.nav}>Авторизация</button>
          </Link>
        )}
        
        {username === "paniccaaa" && email === "semaadamenko1337@il.com" && (
          <Link to="/editor">
            <button className={styles.nav}>Редактор</button>
          </Link>
        )}

        {isAuthenticated && (
          <AccountCircleIcon
            className={styles.nav}
            sx={{ fontSize: 20 }}
            color="action"
            onClick={handleOpenModal}
          />
        )}

        {isModalOpen && isAuthenticated && (
          <div ref={modalRef} className={styles.close_modal}>
            <span className={styles.username}>{username}</span>
            <span onClick={handleLogout} className={styles.exit}>
              Выйти
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
