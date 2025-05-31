import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import RoomDetailComponent from "@/components/client/roomDetails";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <div className="mx-6 md:mx-[100px]">
        <Suspense fallback={<div className="text-center py-10">Loading room details...</div>}>
          <RoomDetailComponent />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
