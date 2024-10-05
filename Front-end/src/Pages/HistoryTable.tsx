import React, { useState } from "react";
import { Input, Button, Modal, Table } from "antd";
import { DeleteOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";
import { useHistories } from "../hooks/useHistories";
import { useDoctors } from "../hooks/useUsers";
import * as HistoryService from "../Services/HistoryService";
import * as message from "../Components/Message";
import { IHistory } from "../Types/types";
import { useMutationHooks } from "../hooks/useMutationHook";
import UpdateHistoryForm from "../Components/UpdateHistoryForm";

interface HistoryTableProps {
  userRole: "admin" | "doctor";
  doctorId?: string | null;
}
const HistoryTable: React.FC<HistoryTableProps> = ({ userRole, doctorId }) => {
  const [searchedText, setSearchText] = useState<string>("");
  const [isUpdateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [selectedHistory, setSelectedHistory] = useState<IHistory | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  const {
    data: histories,
    isLoading: isHistoriesLoading,
    refetch: refetchHistories,
  } = useHistories();
  const { data: doctors } = useDoctors();
  const doctor = doctors?.find((doc) => doc._id === doctorId);
  const filteredHistories = histories?.filter(
    (history) =>
      userRole === "admin" ||
      (userRole === "doctor" && history.doctor_name === doctor?.name)
  );
  const updateHistoryMutation = useMutationHooks(
    (data: { id: string; data: IHistory }) =>
      HistoryService.updateHistory(data.id, data.data)
  );
  const deleteHistoryMutation = useMutationHooks((id: string) =>
    HistoryService.deleteHistory(id)
  );

  const viewHistoryDetails = async (history: IHistory) => {
    setSelectedHistory(history);
    setViewModalOpen(true);
  };

  const handleUpdateHistory = (history: Partial<IHistory>) => {
    if (!selectedHistory || !selectedHistory._id) return;

    const updatedHistory: IHistory = {
      ...selectedHistory,
      ...history,
      _id: selectedHistory._id,
    };

    updateHistoryMutation.mutate(
      { id: updatedHistory._id, data: updatedHistory },
      {
        onSuccess: () => {
          message.success("History updated successfully!");
          setUpdateModalOpen(false);
          refetchHistories();
        },
        onError: () => {
          message.error("Failed to update history.");
        },
      }
    );
  };

  const handleDeleteHistory = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this history?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        deleteHistoryMutation.mutate(id, {
          onSuccess: () => {
            message.success("History deleted successfully!");
            refetchHistories();
          },
          onError: () => {
            message.error("Failed to delete history.");
          },
        });
      },
    });
  };

  const onSearch = (value: string) => {
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
      key: "patient_name",
      title: "Patient Name",
      dataIndex: "patient_name",
      filteredValue: [searchedText],
      onFilter: (value: any, record: any) =>
        String(record.patient_name)
          .toLowerCase()
          .includes(value.toLowerCase()) ||
        String(record.doctor_name).toLowerCase().includes(value.toLowerCase()),
    },
    {
      key: "doctor_name",
      title: "Doctor Name",
      dataIndex: "doctor_name",
    },

    {
      key: "date",
      title: "Date",
      dataIndex: "date",
      render: (text: any) => new Date(text).toLocaleDateString(), // Format date
    },
    {
      key: "actions",
      title: "Actions",
      render: (_: any, record: IHistory) => (
        <div>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => viewHistoryDetails(record)}
          ></Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedHistory(record);
              setUpdateModalOpen(true);
            }}
          ></Button>
          <Button
            className="text-red-500"
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteHistory(record._id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center text-2xl m-5 font-bold">
        <h1>History Dashboard</h1>
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
          dataSource={filteredHistories}
          rowKey="_id"
          pagination={{
            pageSize,
            current: currentPage,
            onChange: handlePageChange,
          }}
          loading={isHistoriesLoading}
        />
      </div>
      <Modal
        title="History Details"
        open={isViewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
      >
        {selectedHistory && (
          <div>
            <p>
              <strong>Patient Name:</strong> {selectedHistory.patient_name}
            </p>
            <p>
              <strong>Doctor Name:</strong> {selectedHistory.doctor_name}
            </p>
            <p>
              <strong>Test Name:</strong> {selectedHistory.test_name}
            </p>
            <p>
              <strong>Difficulty:</strong> {selectedHistory.difficult}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedHistory.date).toLocaleDateString()}
            </p>
            <p>
              <strong>Score:</strong> {selectedHistory.score}
            </p>
            <p>
              <strong>Note:</strong> {selectedHistory.note}
            </p>
          </div>
        )}
      </Modal>
      {selectedHistory && (
        <UpdateHistoryForm
          history={selectedHistory}
          onUpdate={handleUpdateHistory}
          loading={updateHistoryMutation.isPending}
          open={isUpdateModalOpen}
          onCancel={() => setUpdateModalOpen(false)}
        />
      )}
    </div>
  );
};

export default HistoryTable;
