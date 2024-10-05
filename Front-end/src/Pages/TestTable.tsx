import React, { useState } from "react";
import { Input, Button, Modal, Table } from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useTests } from "../hooks/useTests";
import * as TestService from "../Services/TestService";
import * as message from "../Components/Message";
import { ITest } from "../Types/types";
import { useMutationHooks } from "../hooks/useMutationHook";
import CreateTestForm from "../Components/CreateTestForm";
import UpdateTestForm from "../Components/UpdateTestForm";
const TestTable: React.FC = () => {
  const [searchedText, setSearchText] = useState<string>("");
  const [isCreateModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [selectedTest, setSelectedTest] = useState<ITest | null>(null);
  const [answerDetails, setAnswerDetails] = useState<ITest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);
  const {
    data: tests,
    isLoading: isTestsLoading,
    refetch: refetchTests,
  } = useTests();
  const updateTestMutation = useMutationHooks(
    (data: { id: string; data: ITest }) =>
      TestService.updateTest(data.id, data.data)
  );
  const deleteTestMutation = useMutationHooks((id: string) =>
    TestService.deleteTest(id)
  );

  const viewTestDetails = async (test: ITest) => {
    setSelectedTest(test);
    try {
      const testId = test._id;
      const testDetails = await TestService.getTest(testId);
      setAnswerDetails(testDetails.data);
      console.log("answerDetails", answerDetails);

      setViewModalOpen(true);
    } catch (error) {
      message.error("Failed to fetch test details.");
    }
  };
  const handleUpdateTest = (test: Partial<ITest>) => {
    if (!selectedTest || !selectedTest._id) return;

    const updatedTest: ITest = {
      ...selectedTest,
      ...test,
      _id: selectedTest._id,
    };

    updateTestMutation.mutate(
      { id: updatedTest._id, data: updatedTest },
      {
        onSuccess: () => {
          message.success("Test updated successfully!");
          setUpdateModalOpen(false);
          refetchTests();
        },
        onError: () => {
          message.error("Failed to update test.");
        },
      }
    );
  };
  const handleDeleteTest = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this test?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        deleteTestMutation.mutate(id, {
          onSuccess: () => {
            message.success("Test deleted successfully!");
            refetchTests();
          },
          onError: () => {
            message.error("Failed to delete test.");
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
      key: "test_name",
      title: "Test Name",
      dataIndex: "test_name",
      filteredValue: [searchedText],
      onFilter: (value: any, record: any) =>
        String(record.test_name).toLowerCase().includes(value.toLowerCase()) ||
        String(record.type).toLowerCase().includes(value.toLowerCase()),
    },
    {
      key: "type",
      title: "Type",
      dataIndex: "type",
    },
    {
      key: "difficult",
      title: "Difficulty",
      dataIndex: "difficult",
    },
    {
      key: "question",
      title: "Question",
      dataIndex: "question",
    },
    {
      key: "answers",
      title: "Answers",
      render: (text: any, record: ITest) => {
        if (record.answers && record.correct_answer !== "True") {
          return <p>Multi-Choice</p>;
        }
        return <p>Essay</p>;
      },
    },
    {
      key: "score",
      title: "Score",
      dataIndex: "score",
    },
    {
      key: "actions",
      title: "Actions",
      render: (_: any, record: ITest) => (
        <div>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => viewTestDetails(record)}
          ></Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedTest(record);
              setUpdateModalOpen(true);
            }}
          ></Button>
          <Button
            className="text-red-500 "
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTest(record._id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center text-2xl m-5 font-bold">
        <h1>Tests Dashboard</h1>
        <Input.Search
          placeholder="Search..."
          onSearch={onSearch}
          onChange={(e) => onSearch(e.target.value)}
          style={{ width: 400 }}
          size="large"
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalOpen(true)}
        >
          Add Test
        </Button>
      </div>
      <div className="mx-5">
        <Table
          className="shadow-md"
          columns={columns}
          dataSource={tests}
          rowKey="_id"
          pagination={{
            pageSize,
            current: currentPage,
            onChange: handlePageChange,
          }}
          loading={isTestsLoading}
        />
      </div>
      <Modal
        title="Answer Details"
        open={isViewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
      >
        {selectedTest && (
          <>
            <h3>Answer:</h3>
            {answerDetails?.answers ? (
              // Check if any answer is non-empty
              Object.values(answerDetails.answers).some(
                (answer) => answer.trim() !== ""
              ) ? (
                <ul>
                  {answerDetails.answers.A && (
                    <li>
                      <strong>A:</strong> {answerDetails.answers.A}
                    </li>
                  )}
                  {answerDetails.answers.B && (
                    <li>
                      <strong>B:</strong> {answerDetails.answers.B}
                    </li>
                  )}
                  {answerDetails.answers.C && (
                    <li>
                      <strong>C:</strong> {answerDetails.answers.C}
                    </li>
                  )}
                  {answerDetails.answers.D && (
                    <li>
                      <strong>D:</strong> {answerDetails.answers.D}
                    </li>
                  )}
                  <li>
                    <strong>Correct Answer:</strong>{" "}
                    {answerDetails.correct_answer}
                  </li>
                </ul>
              ) : (
                <p>No answers available.</p>
              )
            ) : (
              <p>The answer is essay</p>
            )}
          </>
        )}
      </Modal>
      <CreateTestForm
        open={isCreateModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onCreate={refetchTests}
      />
      {selectedTest && (
        <UpdateTestForm
          test={selectedTest}
          onUpdate={handleUpdateTest}
          loading={updateTestMutation.isPending}
          open={isUpdateModalOpen}
          onCancel={() => setUpdateModalOpen(false)}
        />
      )}
    </div>
  );
};

export default TestTable;
