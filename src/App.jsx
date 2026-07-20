import { cloneElement, useState } from "react";
import { Routes, Route, useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";
import Landing from "./Pages/Landing/Landing";
import Upload from "./Pages/Upload/Upload";

import ExtractionFailed from "./Pages/ExtractionFailed/ExtractionFailed";
import ConfirmData from "./Pages/ConfirmData/ConfirmData";
import Generating from "./Pages/Generating/Generating";
import Question1 from "./Pages/Question1/Question1";
import Question2 from "./Pages/Question2/Question2";
import Question3 from "./Pages/Question3/Question3";
import Question4 from "./Pages/Question4/Question4";
import Question5 from "./Pages/Question5/Question5";
import Question6 from "./Pages/Question6/Question6";
import RoomCatalog from "./Pages/RoomCatalog/RoomCatalog";
import Result3D from "./Pages/Result3D/Result3D";
import Login from "./Pages/Login/Login";
import Signup from "./Pages/Signup/Signup";
import Projects from "./Pages/Projects/Projects";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import { SlideDirectionContext } from "./Components/QuestionLayout/SlideDirectionContext";

const STEP_ORDER = [
  "/questions/1",
  "/questions/2",
  "/questions/3",
  "/questions/4",
  "/questions/5",
  "/questions/6",
  "/room-catalog",
];

// Layout route for the question wizard: animates a carousel slide between
// steps, sliding forward/backward based on which direction the user moved.
function QuestionsOutlet() {
  const location = useLocation();
  const element = useOutlet();
  const currentIndex = STEP_ORDER.indexOf(location.pathname);

  // Track the previous step index in state (not a ref) so direction can be
  // derived safely during render, per React's "adjusting state on prop
  // change" pattern: https://react.dev/learn/you-might-not-need-an-effect
  const [prevIndex, setPrevIndex] = useState(currentIndex);
  const [direction, setDirection] = useState(1);

  if (currentIndex !== prevIndex) {
    setDirection(currentIndex >= prevIndex ? 1 : -1);
    setPrevIndex(currentIndex);
  }

  return (
    <div className="carousel-viewport">
      <MotionConfig reducedMotion="user">
        <SlideDirectionContext.Provider value={direction}>
          <AnimatePresence initial={false} custom={direction}>
            {element && cloneElement(element, { key: location.pathname })}
          </AnimatePresence>
        </SlideDirectionContext.Provider>
      </MotionConfig>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Everything below requires a signed-in account, even on the free
          Basic tier — using the tool (not just saving) is what we track
          per user, so there's no anonymous path through the wizard. */}
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        }
      />
      {/* <Route path="/result" element={<Result />} /> */}
      <Route
        path="/manual-entry"
        element={
          <ProtectedRoute>
            <ExtractionFailed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/confirm-data"
        element={
          <ProtectedRoute>
            <ConfirmData />
          </ProtectedRoute>
        }
      />
      <Route
        path="/generating"
        element={
          <ProtectedRoute>
            <Generating />
          </ProtectedRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <QuestionsOutlet />
          </ProtectedRoute>
        }
      >
        <Route path="/questions/1" element={<Question1 />} />
        <Route path="/questions/2" element={<Question2 />} />
        <Route path="/questions/3" element={<Question3 />} />
        <Route path="/questions/4" element={<Question4 />} />
        <Route path="/questions/5" element={<Question5 />} />
        <Route path="/questions/6" element={<Question6 />} />
        <Route path="/room-catalog" element={<RoomCatalog />} />
      </Route>
      <Route
        path="/result-3d"
        element={
          <ProtectedRoute>
            <Result3D />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
