import { Route, Routes } from "react-router-dom";

import { Admin } from "./pages/Admin/components/Admin/Admin";
import { AuthForm } from "./pages/AuthForm/components/AuthForm/AuthForm";
import { Contacts } from "./pages/Contacts/components/Contacts/Contacts";
import { FullPost } from "./pages/FullPost/components/FullPost/FullPost";
import { Header } from "./modules/Header";
import { Home } from "./pages/Home/components/Home/Home";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import styles from "./App.module.scss";

export const App = () => {
  return (
    <Provider store={store}>
      <div className={styles.main_container}>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/editor" element={<Admin />} />
          <Route path="/contacts" element={<Contacts />}/>
          <Route path="/post/:id" element={<FullPost />} />
        </Routes>
      </div>
    </Provider>
  );
};
