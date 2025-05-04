import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RoomDetailComponent from "@/components/client/roomDetails";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <div className="mx-6 md:mx-[100px]">
        <RoomDetailComponent />
      </div>
      <Footer />
    </div>
  );
}
