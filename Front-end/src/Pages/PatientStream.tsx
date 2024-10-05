import { useContext, useEffect, useState } from "react";
import { RoomContext } from "../Context/RoomContext";
import { VideoPlayer } from "../Components/VideoPlayer";
import * as UserService from "../Services/UserService";
import { useNavigate } from "react-router-dom";
import { message, Modal } from "antd";
import { AudioMutedOutlined, AudioOutlined } from "@ant-design/icons";
import { ws } from "../ws";
import { usePatients } from "../hooks/useUsers";
import MMSETest from "../Components/MMSETest";
import { DataConnection } from "peerjs";
import TheDoorTest from "../Components/TheDoorTest";

export default function PatientStream() {
  const { me, peers, stream } = useContext(RoomContext);
  const navigate = useNavigate();
  const { data: patients } = usePatients();
  const patientId = localStorage.getItem("patient_id");
  const patient = patients?.find((p) => p._id === patientId);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [showMMSETest, setShowMMSETest] = useState(false);
  const [showTheDoorTest, setShowTheDoorTest] = useState(false);
  const [conn, setConn] = useState<DataConnection | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [answersP, setAnswersP] = useState<string>("");
  const [completeMMSE, setCompleteMMSE] = useState(false);
  const [score, setScore] = useState(0);
  const [currentPhase, setCurrentPhase] = useState("start");

  useEffect(() => {
    if (stream && me) {
      ws.emit("join-room", {
        roomId: patientId,
        peerId: me.id,
      });
    }
  }, [stream, me]);

  const handleMuteToggle = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };
  const showTestModal = (testName: string) => {
    if (testName === "MMSE") {
      message.info(`The doctor has started the test ${testName}!`);
      setShowMMSETest(true);
    }
    if (testName === "TheDoor") {
      message.info(`The doctor has started the test ${testName}!`);
      setShowTheDoorTest(true);
    }
  };

  const endTestModal = (testName: string) => {
    if (testName === "MMSE") {
      message.info(`The doctor has ended the test ${testName}!`);
      setShowMMSETest(false);
    }
    if (testName === "TheDoor") {
      message.info(`The doctor has ended the test ${testName}!`);
      setShowTheDoorTest(false);
    }
  };
  useEffect(() => {
    if (!me) {
      console.error("Peer instance is not available.");
      return;
    }
    me.on("connection", (connection) => {
      setConn(connection);
      connection.on("data", (data: unknown) => {
        const stringData = data as string;
        //Test MMSE
        if (stringData === "start-test-MMSE") {
          setAnswers({});
          setScore(0);
          setCurrentQuestionIndex(0);
          showTestModal("MMSE");
        }
        if (stringData.startsWith("answer:")) {
          const [_, questionIndex, answer, scoreP] = stringData.split(":");
          setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [parseInt(questionIndex)]: answer,
          }));
          setCurrentQuestionIndex(parseInt(questionIndex));
          setScore(parseInt(scoreP));
          console.log(
            `Answer received for question ${questionIndex}: ${answer}`
          );
        }
        if (stringData.startsWith("answerS:")) {
          const [_, questionIndex, answer, scoreP] = stringData.split(":");
          setAnswersP(answer);
          setScore(parseInt(scoreP));
          setCurrentQuestionIndex(parseInt(questionIndex));
          console.log(
            `Answer received for question ${questionIndex}: ${answer}`
          );
        }
        if (stringData.startsWith("next-question:")) {
          const [_, questionIndex] = stringData.split(":");
          setCurrentQuestionIndex(parseInt(questionIndex));
        }
        if (stringData.startsWith("complete-test-MMSE with:")) {
          const [_, s] = stringData.split(":");
          setScore(parseInt(s));
          setCompleteMMSE(true);
        }
        if (stringData.startsWith("complete-test-TheDoor with:")) {
          const [_, s] = stringData.split(":");
          setScore(parseInt(s));
        }
        if (stringData === "end-test-MMSE") {
          endTestModal("MMSE");
        }
        // Test The Door
        if (stringData === "start-test-door") {
          setCurrentPhase("start");
          setAnswersP("");
          setScore(0);
          setCurrentQuestionIndex(0);
          showTestModal("TheDoor");
        }
        // Select answers same MMSE
        if (stringData === "end-test-door") {
          endTestModal("TheDoor");
        }
        if (stringData.startsWith("change-phase:")) {
          const [_, currentPhase] = stringData.split(":");
          setCurrentQuestionIndex(0);
          setCurrentPhase(currentPhase);
        }
      });

      connection.on("close", () => {
        console.log("Connection to doctor closed");
        setConn(null);
      });
    });

    return () => {
      me.destroy();
    };
  }, [me]);

  const handleVideoToggle = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const handleLeaveStream = () => {
    Modal.confirm({
      title: "Leave stream",
      content: "Do you want to leave the stream?",
      okText: "Yes",
      cancelText: "No",
      onOk: () => {
        if (me) ws.emit("leave-room", { roomId: patientId, peerId: me.id });
        UserService.logoutUser().then(() => navigate("/"));
      },
    });
  };
  const handleSelection = (
    questionIndex: number,
    answer: string,
    score: number
  ) => {
    if (conn && conn.open) {
      conn.send(`answerS:${questionIndex}:${answer}:${score}`);
      setAnswersP(answer);
      setScore(score);
      setCurrentQuestionIndex(questionIndex);
    }
  };
  const handleAnswerSelection = (
    questionIndex: number,
    answer: string,
    score: number
  ) => {
    if (conn && conn.open) {
      conn.send(`answer:${questionIndex}:${answer}:${score}`);
      setAnswers(answer);
      setScore(score);
      setCurrentQuestionIndex(questionIndex);
    }
  };
  const handleChangePhase = (currentPhase: string) => {
    setCurrentPhase(currentPhase);
  };
  return (
    <div className="w-screen h-screen bg-[#ecd6d6] flex-col">
      <div className="h-4/5 flex justify-center items-center relative">
        <div
          id="main-stream"
          className="lg:w-[60rem] lg:h-[30rem] md:w-[36rem] md:h-[18rem] sm:w-[32rem] sm:h-[16rem] flex rounded-lg bg-black relative"
        >
          {showMMSETest ? (
            <MMSETest
              role="patient"
              answers={answers}
              getScore={score}
              complete={completeMMSE}
              currentQuestionIndex={currentQuestionIndex}
              onAnswerSelection={handleAnswerSelection}
            />
          ) : showTheDoorTest ? (
            <TheDoorTest
              role="patient"
              answers={answersP}
              getScore={score}
              currentPhase={currentPhase}
              onChangePhase={handleChangePhase}
              currentQuestionIndex={currentQuestionIndex}
              onAnswerSelection={handleSelection}
            />
          ) : (
            Object.values(peers)
              .filter((peer) => !!peer.stream)
              .map((peer) => (
                <div className="h-full w-full" key={peer.peerId}>
                  <VideoPlayer stream={peer.stream} isMuted={isMuted} />
                  <div className="w-fit h-fit p-2 rounded-lg bg-gray-600 text-white absolute bottom-0 right-0">
                    Doctor
                  </div>
                </div>
              ))
          )}
        </div>
        <div
          id="secondary-stream"
          className="w-[18rem] h-[10rem] flex justify-end items-end rounded-md bg-black absolute top-4 right-4"
        >
          {stream && (
            <div>
              <VideoPlayer stream={stream} isMuted={isMuted} />
              <div className="w-fit h-fit p-1 text-sm rounded-lg bg-gray-600 absolute bottom-0 right-0 text-white">
                Patient
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="h-1/5 flex flex-row items-center justify-center">
        <button
          id="micro"
          onClick={handleMuteToggle}
          className="bg-black text-white rounded-lg h-20 w-24 flex flex-col justify-center items-center hover:bg-gray-900 hover:border-white"
        >
          {isMuted ? (
            <AudioMutedOutlined style={{ fontSize: "1.5rem", color: "red" }} />
          ) : (
            <AudioOutlined style={{ fontSize: "1.5rem" }} />
          )}
          {isMuted ? "Unmute" : "Mute"}
        </button>
        <button
          id="video"
          onClick={handleVideoToggle}
          className="bg-black  text-white rounded-lg h-20 w-24 flex flex-col justify-center items-center hover:bg-gray-900 hover:border-white"
        >
          {isVideoEnabled ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 text-red-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M.97 3.97a.75.75 0 0 1 1.06 0l15 15a.75.75 0 1 1-1.06 1.06l-15-15a.75.75 0 0 1 0-1.06ZM17.25 16.06l2.69 2.69c.944.945 2.56.276 2.56-1.06V6.31c0-1.336-1.616-2.005-2.56-1.06l-2.69 2.69v8.12ZM15.75 7.5v8.068L4.682 4.5h8.068a3 3 0 0 1 3 3ZM1.5 16.5V7.682l11.773 11.773c-.17.03-.345.045-.523.045H4.5a3 3 0 0 1-3-3Z" />
            </svg>
          )}
          {isVideoEnabled ? "Stop Video" : "Start Video"}
        </button>
        <button
          id="hangout"
          className="bg-red-600 text-white rounded-lg h-20 w-32 flex flex-col justify-center items-center hover:bg-red-500 hover:border-white"
          onClick={handleLeaveStream}
        >
          Leave
        </button>
      </div>
    </div>
  );
}
