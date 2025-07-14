export const metadata = {
  title: "Home - Simple",
  description: "Page description",
};

import Hero from "@/components/hero-home";
import BusinessCategories from "@/components/business-categories";
import FeaturesPlanet from "@/components/features-planet";
import LargeTestimonial from "@/components/large-testimonial";
import Cta from "@/components/cta";
import { DialogExamples } from "@/components/ui/example-dialog";

export default function Home() {
  return (
    <>
      <Hero />
      <BusinessCategories />
      <FeaturesPlanet />
      {/* <LargeTestimonial />
      <Cta /> */}

      {/* Dialog Examples for Testing Accessibility */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto">
          <DialogExamples />
        </div>
      </section>
    </>
  );
}
