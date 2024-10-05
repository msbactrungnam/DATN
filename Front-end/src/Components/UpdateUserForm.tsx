import React from "react";
import { Modal, Form, Input, Button, Row, Col, Select } from "antd";
import { User } from "../Types/types";

interface UpdateUserFormProps {
  open: boolean;
  onCancel: () => void;
  onUpdate: (user: Partial<User>) => void;
  user: User;
  loading: boolean;
}

const UpdateUserForm: React.FC<UpdateUserFormProps> = ({
  open,
  onCancel,
  onUpdate,
  user,
  loading,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue({ ...user, password: "", confirmPassword: "" });
  }, [user, form]);

  const handleFinish = (values: any) => {
    onUpdate({ ...user, ...values });
    form.resetFields(["password", "confirmPassword"]);
  };

  return (
    <Modal title="Update User" open={open} onCancel={onCancel} footer={null}>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Name" name="name">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Age" name="age">
              <Input type="number" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              type: "email",
              message: "The input is not valid E-mail!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Phone" name="phone">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Role" name="role">
              <Select>
                <Select.Option value="admin">Admin</Select.Option>
                <Select.Option value="doctor">Doctor</Select.Option>
                <Select.Option value="patient">Patient</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Address" name="address">
          <Input />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="New Password" name="password">
              <Input.Password />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Confirm New Password" name="confirmPassword">
              <Input.Password />
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

export default UpdateUserForm;
