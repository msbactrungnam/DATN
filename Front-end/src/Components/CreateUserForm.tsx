import React, { useEffect } from "react";
import { Form, Input, InputNumber, Modal, Select, Col, Row } from "antd";
import { useMutationHooks } from "../hooks/useMutationHook";
import * as UserService from "../Services/UserService";
import * as message from "../Components/Message";
import Loading from "../Components/Loading";

const { Option } = Select;

const CreateUserForm: React.FC<{
  open: boolean;
  onCancel: () => void;
  onCreate: () => void;
}> = ({ open, onCancel, onCreate }) => {
  const [form] = Form.useForm();

  const mutation = useMutationHooks((data: UserService.RegisterData) =>
    UserService.createUser(data)
  );
  const { isPending, isSuccess, isError } = mutation;

  useEffect(() => {
    if (isSuccess) {
      message.success("User created successfully!");
    } else if (isError) {
      message.error("Failed to create user. Please try again.");
    }
  }, [isSuccess, isError]);

  const handleFinish = (data: UserService.RegisterData) => {
    mutation.mutate(data);
    form.resetFields();
    onCreate();
  };

  return (
    <Modal
      open={open}
      title="Create New User"
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
        <Form
          form={form}
          layout="vertical"
          name="create_user_form"
          onFinish={handleFinish}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: "Please input the name!" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="age"
                label="Age"
                rules={[{ required: true, message: "Please input the age!" }]}
              >
                <InputNumber min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please input the email!" },
                  { type: "email", message: "The input is not valid E-mail!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Please input the password!" },
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: "Please input the address!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: "Please input the phone number!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select the role!" }]}
          >
            <Select placeholder="Select a role">
              <Option value="admin">Admin</Option>
              <Option value="doctor">Doctor</Option>
              <Option value="patient">Patient</Option>
            </Select>
          </Form.Item>
        </Form>
      </Loading>
    </Modal>
  );
};

export default CreateUserForm;
