import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="p-6">
        <Hero />
        <Services />
        <Contact />
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;