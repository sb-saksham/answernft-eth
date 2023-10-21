import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import RequireAuth from "./hoc/RequireAuth";
import Dashboard from "./components/UI/Dasboard";
import Homepage from './components/Homepage';
// import InstitutionPage from "./components/InstitutionPage";

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard/>}>
            <Route path="" element={<Homepage />} />
            {/* <Route path="company/" element={<RequireAuth><CompanyPage /></RequireAuth>} />
            <Route path="institution/" element={<RequireAuth><InstitutionPage /></RequireAuth>} />
            <Route path="individual/" element={<RequireAuth><IndividualRequestsPage/></RequireAuth>}/> */}
          </Route>
          </Routes>
    </BrowserRouter>
  );
}

export default App;
