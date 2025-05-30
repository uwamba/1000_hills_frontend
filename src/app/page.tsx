import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/components/client/home";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <Home />
      <Footer />
    </div>
  );
}
