import { useState } from "react";
import { Button, Menu } from "antd";
import { Routes, Route, useNavigate } from "react-router-dom";
import DoctorTable from "./DoctorTable";
import PatientTable from "./PatientTable";
import HistoryTable from "./HistoryTable";
import TestTable from "./TestTable";
import * as UserService from "../Services/UserService";
import CreateUserForm from "../Components/CreateUserForm";
export default function AdminPage() {
  const navigate = useNavigate();
  const [isCreateUserVisible, setCreateUserVisible] = useState(false);
  const showCreateUserModal = () => {
    setCreateUserVisible(true);
  };
  const handleLogout = async () => {
    await UserService.logoutUser();
    navigate("/");
  };
  const handleCancel = () => {
    setCreateUserVisible(false);
  };

  const handleCreateUser = () => {
    setCreateUserVisible(false);
    navigate(0);
  };
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes("/admin/doctor")) return "/admin/doctor";
    if (path.includes("/admin/patient")) return "/admin/patient";
    if (path.includes("/admin/history")) return "/admin/history";
    if (path.includes("/admin/test")) return "/admin/test";
    return "/admin/doctor"; // Default key if path does not match
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <div className="h-full w-1/5 border-r shadow-md rounded-2xl flex-col space-y-4">
        <div className="h-5/6">
          <div className="w-full h-20 flex items-center justify-center  font-bold text-3xl">
            <div
              onClick={() => {
                navigate("/admin/doctor");
              }}
              className="text-white bg-black rounded-full h-16 flex items-center justify-center  cursor-pointer select-none"
            >
              <p className="p-1">VCD</p>
            </div>
          </div>
          <div className="h-10 flex items-center justify-center">
            <Button
              type="primary"
              className="w-full mx-4 h-10 font-semibold"
              onClick={showCreateUserModal}
            >
              Create User
            </Button>
          </div>
          <Menu
            className="font-semibold px-4 select-none"
            selectedKeys={[getSelectedKey()]}
            mode="inline"
            theme="light"
            onClick={(item) => {
              navigate(item.key);
            }}
            items={[
              {
                label: "Doctors",
                key: "/admin/doctor",
              },
              {
                label: "Patients",
                key: "/admin/patient",
              },
              {
                label: "Test",
                key: "/admin/test",
              },
              {
                label: "History",
                key: "/admin/history",
              },
            ]}
          />
        </div>
        <div className="flex justify-center items-center">
          <p
            className=" text-[#1677FF] select-none underline text-lg cursor-pointer"
            onClick={handleLogout}
          >
            Logout
          </p>
        </div>
      </div>
      <div className="h-full w-4/5 bg-[#F4F7FD] flex justify-center items-center">
        <div className="h-[90%] w-[90%] bg-white rounded-2xl shadow-md">
          <Routes>
            <Route path="/doctor" element={<DoctorTable />} />
            <Route path="/patient" element={<PatientTable />} />
            <Route path="/test" element={<TestTable />} />
            <Route
              path="/history"
              element={<HistoryTable userRole="admin" />}
            />
          </Routes>
        </div>
      </div>
      <CreateUserForm
        open={isCreateUserVisible}
        onCancel={handleCancel}
        onCreate={handleCreateUser}
      />
    </div>
  );
}
