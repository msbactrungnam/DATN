import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import { routers } from "./Routers/routers";
import { RoomProvider } from "./Context/RoomContext";

export default function App() {
  useEffect(() => {
    fetchApi();
  }, []);

  const fetchApi = async () => {
    const apiUrl = import.meta.env.VITE_BASE_API_URL;
    try {
      const res = await axios.get(`${apiUrl}/user/get-user/`);
      return res.data;
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        {routers.map((route, index) => {
          const { path, page: Page, protected: isProtected } = route;
          if (isProtected) {
            return (
              <Route
                key={index}
                path={path}
                element={
                  <RoomProvider>
                    <Page />
                  </RoomProvider>
                }
              />
            );
          }
          return <Route key={index} path={path} element={<Page />} />;
        })}
      </Routes>
    </BrowserRouter>
  );
}
