import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="p-6">
        <h1 className="text-3xl font-bold underline">Hello, Tailwind + Vite!</h1>
      </main>
    </BrowserRouter>
  );
}

export default App;
