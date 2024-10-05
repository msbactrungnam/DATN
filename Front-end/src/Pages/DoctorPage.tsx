import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Button, Input, Menu, Modal, Table } from "antd";
import * as UserService from "../Services/UserService";
import { Patient } from "../Types/types";
import { ColumnsType } from "antd/es/table";
import HistoryTable from "./HistoryTable";
import { SearchProps } from "antd/es/input";

const DoctorPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchedText, setSearchText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const doctorId = localStorage.getItem("doctor_id");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  useEffect(() => {
    const fetchPatients = async () => {
      if (!doctorId) return;
      try {
        const doctorResponse = await UserService.getUser(doctorId);
        const patientIds = doctorResponse.data.patients;

        if (Array.isArray(patientIds) && patientIds.length > 0) {
          const patientsData = await Promise.all(
            patientIds.map(async (id: string) => {
              const patientResponse = await UserService.getUser(id);
              return patientResponse.data;
            })
          );
          setPatients(patientsData);
        } else {
          console.error("Doctor has no patients or invalid patient IDs");
        }
      } catch (error) {
        console.error("Failed to fetch patients", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, [doctorId]);
  const onSearch: SearchProps["onSearch"] = (value) => {
    setSearchText(value);
  };

  const handleCall = (patientId: string) => {
    Modal.confirm({
      title: "Confirm Call",
      content: "Are you sure you want to call this patient?",
      okText: "Yes",
      cancelText: "No",
      onOk: () => {
        navigate(`/room/call/${patientId}`);
      },
    });
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const columns: ColumnsType<Patient> = [
    {
      key: "index",
      title: "No.",
      render: (_: any, record: any, index: number) => (
        <span>{(currentPage - 1) * pageSize + index + 1}</span>
      ),
    },
    {
      key: "name",
      title: "Name",
      dataIndex: "name",
      render: (text: string) => <span>{text}</span>,
      filteredValue: [searchedText],
      onFilter: (value: any, record: any) => {
        return (
          String(record.name).toLowerCase().includes(value.toLowerCase()) ||
          String(record.age).toLowerCase().includes(value.toLowerCase())
        );
      },
    },
    {
      key: "age",
      title: "Age",
      dataIndex: "age",
      render: (text: number) => <span>{text}</span>,
    },
    {
      key: "email",
      title: "Email",
      dataIndex: "email",
      render: (text: string) => <span>{text}</span>,
    },
    {
      key: "phone",
      title: "Phone Number",
      dataIndex: "phone",
      render: (text: string) => <span>{text}</span>,
    },
    {
      key: "address",
      title: "Address",
      dataIndex: "address",
      render: (text: string) => <span>{text}</span>,
    },

    {
      key: "actions",
      title: "Actions",
      render: (_, record: Patient) => (
        <Button type="primary" onClick={() => handleCall(record._id)}>
          Call
        </Button>
      ),
    },
  ];

  const TableData = () => (
    <div>
      <div className="flex justify-between items-center text-2xl m-5 font-bold">
        <h1>Patients Manager</h1>
        <Input.Search
          placeholder="Search..."
          onSearch={onSearch}
          onChange={(e) => onSearch(e.target.value)}
          style={{ width: 400 }}
          size="large"
        />
      </div>
      <div className="mx-5">
        <Table
          className="shadow-md"
          columns={columns}
          dataSource={patients}
          rowKey="_id"
          pagination={{
            pageSize,
            current: currentPage,
            onChange: handlePageChange,
          }}
          loading={isLoading}
        />
      </div>
    </div>
  );
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes(`/doctor/${doctorId}/patient`))
      return `/doctor/${doctorId}/patient`;
    if (path.includes(`/doctor/${doctorId}/history`))
      return `/doctor/${doctorId}/history`;
    return `/doctor/${doctorId}/patient`; // Default key if path does not match
  };
  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <div className="h-full w-1/5 border-r shadow-md rounded-2xl flex-col space-y-4">
        <div className="h-5/6">
          <div className="w-full h-20 flex items-center justify-center font-bold text-3xl">
            <div
              onClick={() => {
                navigate("/admin/doctor");
              }}
              className="text-white bg-black rounded-full h-16 flex items-center justify-center  cursor-pointer select-none"
            >
              <div className="p-1">VCD</div>
            </div>
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
                label: "Patients",
                key: `/doctor/${doctorId}/patient`,
              },
              {
                label: "History",
                key: `/doctor/${doctorId}/history`,
              },
            ]}
          />
        </div>
        <div className="flex justify-center items-center">
          <p
            className=" text-[#1677FF] select-none underline text-lg cursor-pointer"
            onClick={() => {
              UserService.logoutUser().then(() => navigate("/"));
            }}
          >
            Logout
          </p>
        </div>
      </div>
      <div className="h-full w-4/5 bg-[#F4F7FD] flex justify-center items-center">
        <div className="h-[90%] w-[90%] bg-white rounded-2xl shadow-md">
          <Routes>
            <Route path="/patient" element={<TableData />} />
            <Route
              path="/history"
              element={<HistoryTable userRole="doctor" doctorId={doctorId} />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DoctorPage;
