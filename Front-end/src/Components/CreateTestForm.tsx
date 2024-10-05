import React, { useEffect } from "react";
import { Form, Input, Modal, Col, Row, InputNumber, Select } from "antd";
import { useMutationHooks } from "../hooks/useMutationHook";
import * as TestService from "../Services/TestService";
import * as message from "../Components/Message";
import Loading from "../Components/Loading";
import { ITest } from "../Types/types";

const { Option } = Select;

const CreateTestForm: React.FC<{
  open: boolean;
  onCancel: () => void;
  onCreate: () => void;
}> = ({ open, onCancel, onCreate }) => {
  const [form] = Form.useForm();

  const mutation = useMutationHooks((data: ITest) =>
    TestService.createTest(data)
  );
  const { isPending, isSuccess, isError } = mutation;

  useEffect(() => {
    if (isSuccess) {
      message.success("Test created successfully!");
      onCreate();
    } else if (isError) {
      message.error("Failed to create test. Please try again.");
    }
  }, [isSuccess, isError]);

  const handleFinish = (data: ITest) => {
    mutation.mutate(data);
    form.resetFields();
  };

  return (
    <Modal
      open={open}
      title="Create New Test"
      okText="Create"
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((data) => {
            handleFinish(data);
          })
          .catch((info) => {
            console.log("Validate Failed:", info);
          });
      }}
    >
      <Loading isLoading={isPending}>
        <Form form={form} layout="vertical" name="create_test_form">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="test_name"
                label="Test Name"
                rules={[
                  { required: true, message: "Please input the test name!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="Type">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="difficult"
                label="Difficulty"
                rules={[
                  { required: true, message: "Please input the difficulty!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="question"
                label="Question"
                rules={[
                  { required: true, message: "Please input the question!" },
                ]}
              >
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>Answer</Col>
            <Col span={12}>
              <Form.Item name="['answers', 'A']" label="A">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="['answers', 'B']" label="B">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="['answers', 'C']" label="C">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="['answers', 'D']" label="D">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="correct_answer"
                label="Correct Answer"
                rules={[
                  {
                    required: true,
                    message: "Please select the correct answer!",
                  },
                ]}
              >
                <Select placeholder="Select the correct answer">
                  <Option value="A">A</Option>
                  <Option value="B">B</Option>
                  <Option value="C">C</Option>
                  <Option value="D">D</Option>
                  <Option value="True">True</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="score"
                label="Score"
                rules={[{ required: true, message: "Please input the score!" }]}
              >
                <InputNumber min={0} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Loading>
    </Modal>
  );
};

export default CreateTestForm;
