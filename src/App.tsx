import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Reviews from "./components/Reviews";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="p-6">
        <Hero />
        <Services />
        <Contact />
         <Reviews intervalMs={2000} pauseAfterMs={3000} />
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;