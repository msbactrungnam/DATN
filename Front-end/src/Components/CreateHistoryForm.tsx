import React, { useEffect } from "react";
import {
  Form,
  Input,
  Modal,
  DatePicker,
  Row,
  Col,
  message,
  InputNumber,
} from "antd";
import { useMutationHooks } from "../hooks/useMutationHook";
import * as HistoryService from "../Services/HistoryService";
import Loading from "../Components/Loading";
import { IHistory } from "../Types/types";
import dayjs from "dayjs";

const CreateHistoryForm: React.FC<{
  open: boolean;
  onCancel: () => void;
  onCreate: () => void;
  initialValues?: Partial<IHistory>;
}> = ({ open, onCancel, onCreate, initialValues }) => {
  const [form] = Form.useForm();

  const mutation = useMutationHooks((data: IHistory) =>
    HistoryService.createHistory(data)
  );
  const { isPending, isSuccess, isError } = mutation;

  useEffect(() => {
    if (isSuccess) {
      message.success("History created successfully!");
      onCreate();
    } else if (isError) {
      message.error("Failed to create history. Please try again.");
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        date: initialValues.date ? dayjs(initialValues.date) : undefined,
      });
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    const formattedValues: IHistory = {
      ...values,
      date: values.date ? values.date.toDate() : undefined,
    };
    mutation.mutate(formattedValues);
    form.resetFields();
  };

  return (
    <Modal
      open={open}
      title="Save History"
      okText="Save"
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((data) => handleFinish(data))
          .catch((info) => console.log("Validate Failed:", info));
      }}
    >
      <Loading isLoading={isPending}>
        <Form form={form} layout="vertical" name="create_history_form">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="doctor_name"
                label="Doctor Name"
                rules={[
                  {
                    required: true,
                    message: "Please input the doctor's name!",
                  },
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
                  {
                    required: true,
                    message: "Please input the patient's name!",
                  },
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
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="score" label="Score">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="note" label="Note">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Loading>
    </Modal>
  );
};

export default CreateHistoryForm;
