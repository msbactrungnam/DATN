import { useContext, useEffect, useRef, useState } from "react";
import { RoomContext } from "../Context/RoomContext";
import { VideoPlayer } from "../Components/VideoPlayer";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "antd";
import { DataConnection } from "peerjs";
import {
  AudioMutedOutlined,
  AudioOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import { ws } from "../ws";
import { useDoctors, usePatients } from "../hooks/useUsers";
import MMSETest from "../Components/MMSETest";
import TheDoorTest from "../Components/TheDoorTest";
import CreateHistoryForm from "../Components/CreateHistoryForm";
export default function DoctorStream() {
  const { id } = useParams();
  const { me, peers, stream } = useContext(RoomContext);
  const navigate = useNavigate();
  const { data: doctors } = useDoctors();
  const { data: patients } = usePatients();
  const doctorId = localStorage.getItem("doctor_id");
  const doctor = doctors?.find((doc) => doc._id === doctorId);
  const patient = patients?.find((p) => p._id === id);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null); // ID của bộ đếm thời gian
  const [showMMSETest, setShowMMSETest] = useState(false);
  const [showTheDoorTest, setShowTheDoorTest] = useState(false);
  const [conn, setConn] = useState<DataConnection | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [answersP, setAnswersP] = useState("");
  const [completeMMSE, setCompleteMMSE] = useState(false);
  const [score, setScore] = useState(0);
  const [evaluation, setEvaluation] = useState("");
  const [currentPhase, setCurrentPhase] = useState("start");
  const [isHistoryFormVisible, setIsHistoryFormVisible] = useState(false);
  const [initialFormData, setInitialFormData] = useState<any>(null);
  const [tested, setTested] = useState<{
    test_name: string;
    difficult: string;
  }>({ test_name: "", difficult: "" });

  useEffect(() => {
    if (stream && me) {
      ws.emit("join-room", {
        roomId: id,
        peerId: me.id,
      });
    }
  }, [me, stream]);

  const handleMuteToggle = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const handleVideoToggle = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  useEffect(() => {
    if (!me) {
      console.error("Peer instance is not available.");
      return;
    }

    const connectID = Object.keys(peers).find((peerId) => peerId !== me.id);

    if (!connectID) {
      console.error("No peer to connect to.");
      return;
    }

    const connection = me.connect(connectID);
    setConn(connection);

    connection.on("open", () => {
      console.log("Connected to patient");
    });

    connection.on("data", (data: unknown) => {
      const stringData = data as string;
      if (stringData.startsWith("answer:")) {
        const [_, questionIndex, answer, scoreP] = stringData.split(":");
        setAnswers((prevAnswers) => ({
          ...prevAnswers,
          [parseInt(questionIndex)]: answer,
        }));
        setCurrentQuestionIndex(parseInt(questionIndex));
        setScore(parseInt(scoreP));
      }
      if (stringData.startsWith("answerS:")) {
        const [_, questionIndex, answer, scoreP] = stringData.split(":");
        setAnswersP(answer);
        setScore(parseInt(scoreP));
        setCurrentQuestionIndex(parseInt(questionIndex));
        console.log(`Answer received for question ${questionIndex}: ${answer}`);
      }
    });

    connection.on("close", () => {
      console.log("Connection to patient closed");
      setConn(null);
    });

    return () => {
      connection.close();
    };
  }, [me, peers]);

  const startRecording = () => {
    if (stream) {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev: Blob[]) => [...prev, event.data]);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Bắt đầu bộ đếm thời gian
      const id = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      setIntervalId(id);
    }
  };
  // Stop recording and save the video
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Dừng bộ đếm thời gian
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }

      Modal.confirm({
        title: "Save Recording",
        content: "Do you want to save the recording?",
        okText: "Yes",
        cancelText: "No",
        onOk: () => {
          const blob = new Blob(recordedChunks, { type: "video/webm" });
          const url = URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = `/download/${url}`;
          a.download = `recording_${new Date().toISOString()}.webm`;
          a.click();
          URL.revokeObjectURL(url);
          setRecordedChunks([]);
          setRecordingTime(0);
        },
        onCancel: () => {
          setRecordedChunks([]);
          setRecordingTime(0);
        },
      });
    }
  };

  const handleEndStream = () => {
    setInitialFormData({
      patient_name: patient?.name || "",
      doctor_name: doctor?.name || "",
      test_name: tested.test_name || "",
      difficult: tested.difficult || "",
      date: new Date(),
      score: score,
      note: `${patient?.name}'s result: ${evaluation}`,
    });
    setIsHistoryFormVisible(true);
  };

  const handleFormCreate = () => {
    try {
      setIsHistoryFormVisible(false);
      if (me) ws.emit("end-room", { roomId: id, peerId: me.id });
      navigate(`/doctor/${doctorId}/patient`);
    } catch (error) {
      console.error("Failed to create history", error);
    }
  };
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [hours, minutes, secs].map((v) => (v < 10 ? `0${v}` : v)).join(":");
  };

  const showTestModal = (testName: string) => {
    Modal.confirm({
      title: `Start ${testName}`,
      content: `Do you want to proceed with the ${testName} test?`,
      okText: "Yes",
      cancelText: "No",
      onOk: () => {
        console.log(`Starting ${testName} test...`);
        if (testName === "MMSE") {
          if (conn && conn.open) {
            setCompleteMMSE(false);
            setCurrentQuestionIndex(0);
            setScore(0);
            setAnswers({});
            conn.send("start-test-MMSE");
            setShowMMSETest(true);
          } else {
            console.error(
              "Connection is not open. Current status:",
              conn?.open
            );
          }
        }
        if (testName === "The Door") {
          if (conn && conn.open) {
            setCurrentPhase("start");
            setCurrentQuestionIndex(0);
            setScore(0);
            setAnswers({});
            conn.send("start-test-door");
            setShowTheDoorTest(true);
          } else {
            console.error(
              "Connection is not open. Current status:",
              conn?.open
            );
          }
        }
      },
    });
  };

  const endTestModal = (testName: string) => {
    Modal.confirm({
      title: `End ${testName}`,
      content: `Do you want to end the ${testName} test?`,
      okText: "Yes",
      cancelText: "No",
      onOk: () => {
        console.log(`Ending ${testName} test...`);

        if (testName === "MMSE") {
          if (conn && conn.open) {
            conn.send("end-test-MMSE");
            setShowMMSETest(false);
          } else {
            console.error(
              "Connection is not close. Current status:",
              conn?.open
            );
          }
        }
        if (testName === "The Door") {
          if (conn && conn.open) {
            conn.send("end-test-door");
            setShowTheDoorTest(false);
          }
        }
      },
    });
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
  const handleNextQuestion = (questionIndex: number) => {
    if (conn && conn.open) {
      conn.send(`next-question:${questionIndex}`);
      setCurrentQuestionIndex(questionIndex);
    }
  };

  const handleCompleteMMSE = (
    score: number,
    evaluation: string,
    test_name?: string | null,
    difficult?: string | null
  ) => {
    if (conn && conn.open) {
      conn.send(`complete-test-MMSE with:${score}`);
      setScore(score);
      setEvaluation(evaluation);
      setCompleteMMSE(true);
      setTested({ test_name: test_name ?? "", difficult: difficult ?? "" });
    }
  };
  const handleCompleteTheDoor = (
    score: number,
    evaluation: string,
    test_name?: string | null,
    difficult?: string | null
  ) => {
    if (conn && conn.open) {
      conn.send(`complete-test-TheDoor with:${score}`);
      setScore(score);
      setEvaluation(evaluation);
      setTested({ test_name: test_name ?? "", difficult: difficult ?? "" });
    }
  };

  const handleChangePhase = (currentPhase: string) => {
    if (conn && conn.open) {
      conn.send(`change-phase:${currentPhase}`);
      setCurrentQuestionIndex(0);
      setCurrentPhase(currentPhase);
    }
  };
  return (
    <div className="w-screen h-screen bg-[#ecd6d6] flex flex-row">
      <div className="w-1/5 h-screen bg-white flex flex-col justify-center items-center select-none">
        <h1 className="text-4xl font-bold mb-8">Dementia Test</h1>
        {!showMMSETest && !showTheDoorTest ? (
          <>
            <button
              onClick={() => showTestModal("MMSE")}
              className="w-4/5 h-12 mb-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
            >
              Test MMSE
            </button>
            {/* <button
              onClick={() => showTestModal("The Door")}
              className="w-4/5 h-12 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
            >
              Test "The Door"
            </button> */}
          </>
        ) : showMMSETest ? (
          <>
            <button
              onClick={() => endTestModal("MMSE")}
              className="w-4/5 h-12 mb-4 bg-red-600 text-white rounded-lg hover:bg-red-500 focus:outline-none"
            >
              End test MMSE
            </button>
          </>
        ) : showTheDoorTest ? (
          <>
            <button
              onClick={() => endTestModal("The Door")}
              className="w-4/5 h-12 mb-4 bg-red-600 text-white rounded-lg hover:bg-red-500 focus:outline-none"
            >
              End test "The Door"
            </button>
          </>
        ) : null}
      </div>
      <div className="w-4/5 h-screen">
        <div className="h-4/5 flex justify-center items-end relative">
          {!showMMSETest && !showTheDoorTest ? (
            <>
              <div
                id="main-stream"
                className="w-5/6 h-[90%] flex justify-end items-end rounded-lg bg-black relative"
              >
                {Object.values(peers)
                  .filter((peer) => !!peer.stream)
                  .map((peer) => (
                    <div className="h-full w-full" key={peer.peerId}>
                      <VideoPlayer stream={peer.stream} isMuted={isMuted} />
                      <div className="w-fit h-fit p-2 text-sm rounded-lg bg-gray-600 absolute bottom-0 right-0 text-white">
                        Patient
                      </div>
                    </div>
                  ))}
              </div>
              <div
                id="secondary-stream"
                className="w-[18rem] h-[10rem] flex justify-end items-end rounded-md bg-black absolute top-4 right-4"
              >
                {stream && doctor && (
                  <div>
                    <VideoPlayer stream={stream} isMuted={isMuted} />
                    <div className="w-fit h-fit p-1 text-sm rounded-lg bg-gray-600 absolute bottom-0 right-0 text-white">
                      Doctor
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : showMMSETest ? (
            <>
              <div
                id="main-stream"
                className="w-5/6 h-[90%] flex justify-end items-end rounded-lg bg-black relative"
              >
                <MMSETest
                  role="doctor"
                  answers={answers}
                  getScore={score}
                  complete={completeMMSE}
                  onComplete={handleCompleteMMSE}
                  currentQuestionIndex={currentQuestionIndex}
                  onAnswerSelection={handleSelection}
                  onNextQuestion={handleNextQuestion}
                />
              </div>
              <div
                id="secondary-stream"
                className="w-[18rem] h-[10rem] flex justify-end items-end rounded-md bg-black absolute top-4 right-4"
              >
                {Object.values(peers)
                  .filter((peer) => !!peer.stream)
                  .map((peer) => (
                    <div className="h-full w-full" key={peer.peerId}>
                      <VideoPlayer stream={peer.stream} isMuted={isMuted} />
                      <div className="w-fit h-fit p-2 text-sm rounded-lg bg-gray-600 absolute bottom-0 right-0 text-white">
                        Patient
                      </div>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <>
              <div
                id="main-stream"
                className="w-5/6 h-[90%] flex justify-end items-end rounded-lg bg-black relative"
              >
                <TheDoorTest
                  role="doctor"
                  answers={answersP}
                  getScore={score}
                  currentPhase={currentPhase}
                  onChangePhase={handleChangePhase}
                  onNextQuestion={handleNextQuestion}
                  currentQuestionIndex={currentQuestionIndex}
                  onAnswerSelection={handleAnswerSelection}
                  onComplete={handleCompleteTheDoor}
                />
              </div>
              <div
                id="secondary-stream"
                className="w-[18rem] h-[10rem] flex justify-end items-end rounded-md bg-black absolute top-4 right-4"
              >
                {Object.values(peers)
                  .filter((peer) => !!peer.stream)
                  .map((peer) => (
                    <div className="h-full w-full" key={peer.peerId}>
                      <VideoPlayer stream={peer.stream} isMuted={isMuted} />
                      <div className="w-fit h-fit p-2 text-sm rounded-lg bg-gray-600 absolute bottom-0 right-0 text-white">
                        Patient
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
          {isRecording && (
            <div className="w-fit h-fit absolute top-4 left-4 bg-white text-red-600 rounded-full p-1 font-bold">
              Recording: {formatTime(recordingTime)}
            </div>
          )}
        </div>
        <div className="h-1/5 flex flex-row items-center justify-center">
          <button
            id="micro"
            onClick={handleMuteToggle}
            className="bg-black text-white rounded-lg h-20 w-24 flex flex-col justify-center items-center hover:bg-gray-900 hover:border-white"
          >
            {isMuted ? (
              <AudioMutedOutlined
                style={{ fontSize: "1.5rem", color: "red" }}
              />
            ) : (
              <AudioOutlined style={{ fontSize: "1.5rem" }} />
            )}
            {isMuted ? "Unmute" : "Mute"}
          </button>
          <button
            id="video"
            onClick={handleVideoToggle}
            className="bg-black text-white rounded-lg h-20 w-24 flex flex-col justify-center items-center hover:bg-gray-900 hover:border-white"
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
            id="record"
            onClick={isRecording ? stopRecording : startRecording}
            className="bg-black text-white rounded-lg h-20 w-24 flex flex-col justify-center items-center hover:bg-gray-900 hover:border-white"
          >
            {isRecording ? (
              <PauseCircleOutlined
                style={{ fontSize: "1.5rem", color: "red" }}
              />
            ) : (
              <PlayCircleOutlined style={{ fontSize: "1.5rem" }} />
            )}
            {isRecording ? "Stop Record" : "Start Record"}
          </button>
          <button
            id="end"
            onClick={handleEndStream}
            className="bg-red-600 text-white rounded-lg h-20 w-24 flex flex-col justify-center items-center hover:bg-red-700 hover:border-white"
          >
            End
          </button>
        </div>
      </div>
      <CreateHistoryForm
        open={isHistoryFormVisible}
        onCancel={() => setIsHistoryFormVisible(false)}
        onCreate={handleFormCreate}
        initialValues={initialFormData}
      />
    </div>
  );
}
