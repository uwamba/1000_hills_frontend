import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RetreatList from "@/components/client/retreatList";


export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <div className="mx-6 md:mx-[100px]">
        <RetreatList />
      </div>
      <Footer />
    </div>
  );
}