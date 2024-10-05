import React, { useState, useEffect } from "react";
import { Input, Button, Modal, Table } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { usePatients, useDoctors } from "../hooks/useUsers"; // Update import path if necessary
import * as UserService from "../Services/UserService";
import UpdateUserForm from "../Components/UpdateUserForm";
import * as message from "../Components/Message";
import { Patient, User } from "../Types/types";
import { useMutationHooks } from "../hooks/useMutationHook";
import type { GetProps } from "antd";
type SearchProps = GetProps<typeof Input.Search>;

const PatientTable: React.FC = () => {
  const [searchedText, setSearchText] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
  const [doctorNames, setDoctorNames] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const {
    data: patients,
    isLoading: isPatientsLoading,
    refetch: refetchPatients,
  } = usePatients();
  const { data: doctors } = useDoctors();

  const updateUserMutation = useMutationHooks(
    (data: { id: string; data: UserService.UpdateUserData }) =>
      UserService.updateUser(data.id, data.data)
  );
  const deleteUserMutation = useMutationHooks((id: string) =>
    UserService.deleteUser(id)
  );

  useEffect(() => {
    const fetchDoctorNames = async () => {
      if (!patients || !doctors) return;
      const doctorNameMap: { [key: string]: string } = {};

      // Collect all unique doctor IDs from patients
      const doctorIds = Array.from(
        new Set(patients.flatMap((patient) => patient.doctor))
      );

      // Fetch doctor details
      const doctorDetailsPromises = doctorIds.map((doctorId) =>
        UserService.getUser(doctorId)
      );

      try {
        const doctorResponses = await Promise.all(doctorDetailsPromises);
        doctorResponses.forEach((response) => {
          doctorNameMap[response.data._id] = response.data.name;
        });
        setDoctorNames(doctorNameMap);
      } catch (error) {
        message.error("Failed to fetch doctor details.");
      }
    };

    fetchDoctorNames();
  }, [patients, doctors]);

  const getDoctorName = (doctorId: string | undefined): string => {
    return doctorId ? doctorNames[doctorId] || "None" : "None";
  };

  const handleUpdateUser = (user: Partial<User>) => {
    if (!user._id) return;

    const updateUserPayload: UserService.UpdateUserData = {
      name: user.name,
      email: user.email,
      age: user.age,
      phone: user.phone,
      address: user.address,
      role: user.role as "doctor" | "patient" | undefined,
      password: user.password,
    };

    updateUserMutation.mutate(
      {
        id: user._id,
        data: updateUserPayload,
      },
      {
        onSuccess: () => {
          message.success("User updated successfully!");
          setUpdateModalOpen(false);
          refetchPatients(); // Refresh the patients data
        },
        onError: () => {
          message.error("Failed to update user.");
        },
      }
    );
  };

  const handleDeleteUser = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this user?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        deleteUserMutation.mutate(id, {
          onSuccess: () => {
            message.success("User deleted successfully!");
            refetchPatients(); // Refresh the patients data
          },
          onError: () => {
            message.error("Failed to delete user.");
          },
        });
      },
    });
  };

  const onSearch: SearchProps["onSearch"] = (value) => {
    setSearchText(value);
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };
  const columns = [
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
      key: "caringByDoctor",
      title: "Caring By Doctor",
      render: (_: any, record: Patient) => {
        const doctorId = record.doctor; // Assuming patient.doctor is an array and you want the first doctor
        const doctorName = getDoctorName(doctorId);
        return <span>{doctorName}</span>;
      },
    },
    {
      key: "actions",
      title: "Actions",
      render: (_: any, record: Patient) => (
        <div>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedUser(record);
              setUpdateModalOpen(true);
            }}
            disabled={updateUserMutation.isPending}
          ></Button>
          <Button
            className="text-red-500 mx-1"
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record._id)}
          ></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center text-2xl m-5 font-bold">
        <h1>Patients Dashboard</h1>
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
          loading={isPatientsLoading}
        />
      </div>
      {selectedUser && (
        <UpdateUserForm
          open={isUpdateModalOpen}
          onCancel={() => setUpdateModalOpen(false)}
          onUpdate={handleUpdateUser}
          user={selectedUser}
          loading={updateUserMutation.isPending}
        />
      )}
    </div>
  );
};

export default PatientTable;
