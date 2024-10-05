import React from "react";
import { Modal, Form, Input, Button, Row, Col, Select } from "antd";
import { ITest } from "../Types/types";

interface UpdateTestFormProps {
  open: boolean;
  onCancel: () => void;
  onUpdate: (test: Partial<ITest>) => void;
  test: ITest;
  loading: boolean;
}

const UpdateTestForm: React.FC<UpdateTestFormProps> = ({
  open,
  onCancel,
  onUpdate,
  test,
  loading,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue({
      test_name: test.test_name,
      type: test.type,
      difficult: test.difficult,
      question: test.question,
      answers: test.answers || {},
      correct_answer: test.correct_answer,
    });
  }, [test, form]);

  const handleFinish = (values: any) => {
    onUpdate({ ...test, ...values });
    form.resetFields();
  };

  return (
    <Modal title="Update Test" open={open} onCancel={onCancel} footer={null}>
      <Form
        form={form}
        initialValues={test}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item label="Test Name" name="test_name">
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Type" name="type">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Difficulty" name="difficult">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Question" name="question">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Row>Answer</Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="A" name={["answers", "A"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="B" name={["answers", "B"]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="C" name={["answers", "C"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="D" name={["answers", "D"]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Correct Answer" name="correct_answer">
              <Select>
                <Select.Option value="A">A</Select.Option>
                <Select.Option value="B">B</Select.Option>
                <Select.Option value="C">C</Select.Option>
                <Select.Option value="D">D</Select.Option>
                <Select.Option value="True">True</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Score" name="score">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateTestForm;
