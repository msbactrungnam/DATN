import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "antd";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import * as UserService from "../Services/UserService";
import { useMutationHooks } from "../hooks/useMutationHook";
import Loading from "../Components/Loading";
import * as message from "../Components/Message";
import { JwtPayload, jwtDecode } from "jwt-decode";
interface DecodedPayload extends JwtPayload {
  id: string;
  role: "admin" | "doctor" | "patient";
}
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const mutation = useMutationHooks(
    (data: { email: string; password: string }) => UserService.loginUser(data)
  );
  const { data, isPending, isSuccess, isError } = mutation;

  useEffect(() => {
    if (isSuccess) {
      if (data?.access_token) {
        message.success("Login successful!");
        localStorage.setItem("access_token", data?.access_token);
        const decoded = jwtDecode<DecodedPayload>(data.access_token);
        console.log("decoded", decoded);
        localStorage.setItem("user_id", decoded.id);
        switch (data.checkUser.role) {
          case "admin":
            navigate("/admin/doctor");
            break;
          case "doctor":
            localStorage.setItem("doctor_id", decoded.id || "");
            navigate(`/doctor/${decoded.id}/patient`);
            break;
          case "patient":
            localStorage.setItem("patient_id", decoded.id || "");
            navigate(`/room/answer/${decoded.id}`);
            break;
          default:
            navigate("/");
            break;
        }
      } else message.error("Login failed. Please try again.");
    } else if (isError) {
      message.error(
        "Login failed. Please check your credentials and try again."
      );
    }
  }, [isSuccess, isError, data, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="flex h-screen w-1/2 flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-2xl font-bold leading-9 text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <Loading isLoading={isPending}>
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email
                </label>
                <div className="mt-2">
                  <Input
                    size="large"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Password
                  </label>
                </div>
                <div className="mt-2">
                  <Input.Password
                    size="large"
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    iconRender={(visible) =>
                      visible ? (
                        <EyeOutlined onClick={togglePasswordVisibility} />
                      ) : (
                        <EyeInvisibleOutlined
                          onClick={togglePasswordVisibility}
                        />
                      )
                    }
                  />
                </div>
              </div>
              <div className="w-full flex items-center justify-center">
                <button
                  type="submit"
                  className="flex w-1/2 h-10 items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                  Sign in
                </button>
              </div>
            </form>
          </Loading>
        </div>
      </div>
      <div className="w-1/2 h-screen bg-[#77654b]">
        <h1 className="m-4 text-3xl font-bold text-center text-white">
          Elderly Dementia Diagnosis Video Conference System
        </h1>
        <img
          className="w-full h-screen object-cover"
          src="../../public/Images/theme.png"
          alt="Conference System"
        />
      </div>
    </div>
  );
}
