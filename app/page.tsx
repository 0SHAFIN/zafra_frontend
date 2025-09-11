import Navbar from "./component/navbar";
import Footer from "./component/footer";
import Hero from "./component/page/home/hero";
import FeaturedPerfumes from "./component/page/home/featured-perfumes";
import AboutSection from "./component/page/home/about-section";
import Testimonials from "./component/page/home/testimonials";
import Newsletter from "./component/page/home/newsletter";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedPerfumes />
      <AboutSection />
      <Testimonials />
      <Newsletter />
    </div>
  );
}