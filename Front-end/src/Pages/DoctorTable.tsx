import React, { useState } from "react";
import { Input, Button, Modal, Form, Select, Table } from "antd";
import { DeleteOutlined, EditOutlined, MinusOutlined } from "@ant-design/icons";
import { useDoctors, usePatients } from "../hooks/useUsers"; // Update import path if necessary
import * as UserService from "../Services/UserService";
import UpdateUserForm from "../Components/UpdateUserForm";
import * as message from "../Components/Message";
import { Doctor, Patient, User } from "../Types/types";
import { useMutationHooks } from "../hooks/useMutationHook";
import type { GetProps } from "antd";
type SearchProps = GetProps<typeof Input.Search>;

const DoctorTable: React.FC = () => {
  const [searchedText, setSearchText] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isShowPatientsModalOpen, setShowPatientsModalOpen] =
    useState<boolean>(false);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
  const [caringPatientDetails, setCaringPatientDetails] = useState<Patient[]>(
    []
  );
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const {
    data: doctors,
    isLoading: isDoctorsLoading,
    refetch: refetchDoctors,
  } = useDoctors();
  const { data: patients } = usePatients();
  const patientOptions = Array.isArray(patients)
    ? patients.map((patient) => ({
        value: patient._id,
        label: `${patient.name} (${patient.age} age)`,
      }))
    : [];

  const addPatientsToDoctorMutation = useMutationHooks(
    (data: { doctorId: string; patientId: string }) =>
      UserService.addPatientToDoctor(data)
  );
  const addDoctorToPatientMutation = useMutationHooks(
    (data: { patientId: string; doctorId: string }) =>
      UserService.addDoctorToPatient(data)
  );

  const updateUserMutation = useMutationHooks(
    (data: { id: string; data: UserService.UpdateUserData }) =>
      UserService.updateUser(data.id, data.data)
  );
  const deleteUserMutation = useMutationHooks((id: string) =>
    UserService.deleteUser(id)
  );
  const removePatientMutation = useMutationHooks(
    (data: { doctorId: string; patientId: string }) =>
      UserService.removePatientFromDoctor(data)
  );
  const removeDoctorMutation = useMutationHooks(
    (data: { patientId: string; doctorId: string }) =>
      UserService.removeDoctorFromPatient(data)
  );

  const handleShowPatients = async (doctor: Doctor) => {
    setCurrentDoctor(doctor);
    try {
      if (doctor.patients) {
        const patientDetailsPromises = doctor.patients.map((patientId) =>
          UserService.getUser(patientId)
        );

        const patientDetailsResponses = await Promise.all(
          patientDetailsPromises
        );
        const patientsDetails = patientDetailsResponses.map(
          (response) => response.data
        );

        setCaringPatientDetails(patientsDetails);
      }
    } catch (error) {
      message.error("Failed to fetch caring patients.");
    }
    setShowPatientsModalOpen(true);
  };

  const handleAddPatient = async () => {
    if (!currentDoctor || !selectedPatient) return;

    const patient = await UserService.getUser(selectedPatient);

    if (patient.data.doctor && patient.data.doctor.length > 0) {
      message.error("Selected patient already has a doctor.");
      return;
    }

    // Add patient to doctor
    addPatientsToDoctorMutation.mutate(
      {
        doctorId: currentDoctor._id,
        patientId: selectedPatient,
      },
      {
        onSuccess: () => {
          // Add doctor to patient
          addDoctorToPatientMutation.mutate(
            {
              patientId: selectedPatient,
              doctorId: currentDoctor._id,
            },
            {
              onSuccess: () => {
                message.success("Patient added successfully!");
                setSelectedPatient("");
                setShowPatientsModalOpen(false);
                refetchDoctors();
              },
              onError: () => {
                message.error("Failed to add doctor to patient.");
              },
            }
          );
        },
        onError: () => {
          message.error("Failed to add patient.");
        },
      }
    );
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
          refetchDoctors(); // Refresh the doctors data
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
            refetchDoctors(); // Refresh the doctors data
          },
          onError: () => {
            message.error("Failed to delete user.");
          },
        });
      },
    });
  };

  const handleRemovePatient = (patientId: string) => {
    if (!currentDoctor) return;

    Modal.confirm({
      title: "Are you sure you want to remove this patient?",
      content: "This will unlink the patient from the doctor.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        removePatientMutation.mutate(
          {
            doctorId: currentDoctor._id,
            patientId,
          },
          {
            onSuccess: () => {
              // Remove doctor from patient
              removeDoctorMutation.mutate(
                {
                  patientId,
                  doctorId: currentDoctor._id,
                },
                {
                  onSuccess: () => {
                    message.success("Patient removed successfully!");
                    setShowPatientsModalOpen(false);
                    refetchDoctors();
                  },
                  onError: () => {
                    message.error("Failed to remove doctor from patient.");
                  },
                }
              );
            },
            onError: () => {
              message.error("Failed to remove patient.");
            },
          }
        );
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
      key: "email",
      title: "Email",
      dataIndex: "email",
      render: (text: string) => <span>{text}</span>,
    },
    {
      key: "age",
      title: "Age",
      dataIndex: "age",
      render: (text: number) => <span>{text}</span>,
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
      render: (_: any, record: Doctor) => (
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
          <Button
            onClick={() => handleShowPatients(record)}
            disabled={isDoctorsLoading}
          >
            View Patients
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center text-2xl m-5 font-bold">
        <h1>Doctors Dashboard</h1>
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
          dataSource={doctors}
          rowKey="_id"
          pagination={{
            pageSize,
            current: currentPage,
            onChange: handlePageChange,
          }}
          loading={isDoctorsLoading}
        />
      </div>
      <Modal
        title="Manage Patients"
        open={isShowPatientsModalOpen}
        onCancel={() => setShowPatientsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Select Patient">
            <Select
              placeholder="Please select"
              value={selectedPatient}
              onChange={setSelectedPatient}
              options={patientOptions}
            />
          </Form.Item>
          <Button type="primary" onClick={handleAddPatient}>
            Add Patients
          </Button>
          <div style={{ marginTop: 20 }}>
            <h3>Caring Patients:</h3>
            {caringPatientDetails.length > 0 && (
              <ul>
                {caringPatientDetails.map((patient) => (
                  <li key={patient._id}>
                    {patient.name}( {patient.age} age)
                    <Button
                      type="text"
                      className="text-red-500 ml-2"
                      icon={<MinusOutlined />}
                      onClick={() => handleRemovePatient(patient._id)}
                    ></Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Form>
      </Modal>
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

export default DoctorTable;
