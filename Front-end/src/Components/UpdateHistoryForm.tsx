import React, { useEffect } from "react";
import { Form, Input, Modal, Button, DatePicker, Row, Col } from "antd";
import { IHistory } from "../Types/types";
import dayjs from "dayjs";

interface UpdateHistoryFormProps {
  history: IHistory;
  onUpdate: (history: Partial<IHistory>) => void;
  open: boolean;
  onCancel: () => void;
  loading: boolean;
}

const UpdateHistoryForm: React.FC<UpdateHistoryFormProps> = ({
  history,
  onUpdate,
  open,
  onCancel,
  loading,
}) => {
  const [form] = Form.useForm();

  // Ensure initialValues are set correctly
  useEffect(() => {
    form.setFieldsValue({
      ...history,
      date: history.date ? dayjs(history.date) : null, // Convert to dayjs object
    });
  }, [history, form]);

  const handleFinish = (values: any) => {
    onUpdate({
      ...values,
      date: values.date ? values.date.toISOString() : undefined, // Convert dayjs object to ISO string
    });
  };

  return (
    <Modal title="Update History" open={open} onCancel={onCancel} footer={null}>
      <Form form={form} onFinish={handleFinish} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="doctor_name"
              label="Doctor Name"
              rules={[
                { required: true, message: "Please input the doctor's name!" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="patient_name"
              label="Patient Name"
              rules={[
                { required: true, message: "Please input the patient's name!" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="test_name" label="Test Name">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="difficult" label="Difficulty">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: "Please select a date!" }]}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="score" label="Score">
              <Input type="number" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="note" label="Note">
          <Input.TextArea />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateHistoryForm;
