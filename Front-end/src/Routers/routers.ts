import DoctorPage from "../Pages/DoctorPage";
import PatientStream from "../Pages/PatientStream";
import Login from "../Pages/Login";
import AdminPage from "../Pages/AdminPage";
import { ComponentType } from "react";
import DoctorStream from "../Pages/DoctorStream";

interface Route {
  path: string;
  page: ComponentType;
  protected?: boolean;
}

export const routers: Route[] = [
  {
    path: "/",
    page: Login,
  },
  {
    path: "/admin/*",
    page: AdminPage,
  },
  {
    path: "/doctor/:id/*",
    page: DoctorPage,
  },
  {
    path: "/room/call/:id",
    page: DoctorStream,
    protected: true,
  },
  {
    path: "/room/answer/:id",
    page: PatientStream,
    protected: true,
  },
];
