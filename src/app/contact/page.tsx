import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactUsComponent from "@/components/client/contactus";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <div className="mx-6 md:mx-[100px]">
        <ContactUsComponent />
      </div>
      <Footer />
    </div>
  );
}
