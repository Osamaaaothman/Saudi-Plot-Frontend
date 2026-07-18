import { Routes, Route } from "react-router-dom";
import Upload from "./Pages/Upload/Upload";
import Result from "./Pages/Result/Result";
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Upload />} />
      <Route path="/result" element={<Result />} />
      <Route path="/manual-entry" element={<ExtractionFailed />} />
      <Route path="/confirm-data" element={<ConfirmData />} />
      <Route path="/generating" element={<Generating />} />
      <Route path="/questions/1" element={<Question1 />} />
      <Route path="/questions/2" element={<Question2 />} />
      <Route path="/questions/3" element={<Question3 />} />
      <Route path="/questions/4" element={<Question4 />} />
      <Route path="/questions/5" element={<Question5 />} />
      <Route path="/questions/6" element={<Question6 />} />
      <Route path="/room-catalog" element={<RoomCatalog />} />
      <Route path="/result-3d" element={<Result3D />} />
    </Routes>
  );
}
