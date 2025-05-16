import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RoomListClientPage from "@/components/client/roomList";
import ApartmentList from "@/components/client/apartmentList";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <div className="mx-6 md:mx-[100px]">
        <ApartmentList />
      </div>
      <Footer />
    </div>
  );
}
