import { Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";

import styles from "./App.module.scss";
import { AuthForm } from "./pages/AuthForm/components/AuthForm/AuthForm";
import { Home } from "./pages/Home/components/Home/Home";
import { Header } from "./modules/Header";
import { store } from "./redux/store";
import { Admin } from "./pages/Admin/components/Admin/Admin";
import { FullPost } from "./pages/FullPost/components/FullPost/FullPost";

export const App = () => {
  return (
    <Provider store={store}>
      <div className={styles.main_container}>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/editor" element={<Admin />} />
          <Route path="/post/:id" element={<FullPost />} />
        </Routes>
      </div>
    </Provider>
  );
};
