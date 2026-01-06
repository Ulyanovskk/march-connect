import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/home/HeroBanner';
import CategoriesSection from '@/components/home/CategoriesSection';
import PopularProducts from '@/components/home/PopularProducts';
import VendorCTA from '@/components/home/VendorCTA';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <HeroBanner />
        <CategoriesSection />
        <PopularProducts />
        <VendorCTA />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
