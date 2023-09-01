import {
  setEmail,
  setIsAuthenticated,
  setUsername,
} from "../../Auth/store/reducer/authUser";

type ContentUser = {
  email: string;
  password: string;
  fullName: string;
  id: number;
};

export const fetchDataUser = async (
  accessToken: string | null,
  dispatch: any
) => {
  if (accessToken) {
    const res = await fetch("https://501881a3cd249a1b.mokky.dev/auth_me", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.ok) {
      const content: ContentUser = await res.json();
      dispatch(setIsAuthenticated(true));
      dispatch(setUsername(content.fullName));
      dispatch(setEmail(content.email));
    } else {
      alert("Не получилось(");
    }
  }
};
