import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import RequireAuth from "./hoc/RequireAuth";
import Dashboard from "./components/UI/Dasboard";
import Homepage from './components/Homepage';
import MyNfts from "./components/MyNfts";

function App() {

  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard/>}>
            <Route path="" element={<Homepage />} />
            <Route path="my/nfts/" element={<RequireAuth><MyNfts /></RequireAuth>} />
          </Route>
          </Routes>
    </BrowserRouter>
  );
}

export default App;
