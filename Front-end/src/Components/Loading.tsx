import React from "react";
import { Spin } from "antd";

export interface LoadingComponentProps {
  isLoading: boolean;
  delay?: number;
  children?: React.ReactNode;
}

const Loading: React.FC<LoadingComponentProps> = ({
  children,
  isLoading,
  delay = 200,
}) => {
  return (
    <Spin spinning={isLoading} delay={delay} size="large">
      {children}
    </Spin>
  );
};

export default Loading;
