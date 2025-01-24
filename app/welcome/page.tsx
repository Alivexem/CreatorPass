import React from 'react'
import NavBar from '@/components/NavBar'
import { Gi3dGlasses } from "react-icons/gi";
import Image from 'next/image';
import { RiHeart2Line } from "react-icons/ri";
import Footer from '@/components/Footer';
import Link from 'next/link'
import { FaUnlockKeyhole } from "react-icons/fa6";
import { FaBridgeCircleCheck } from "react-icons/fa6";
import { SiFueler } from "react-icons/si";
import { RiVipCrown2Fill } from "react-icons/ri";
import { FaFire } from "react-icons/fa6";

interface AccessCardProps {
  image: string;
  name: string;
  className: string;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Page = () => {
  return (
    <div className='min-h-screen bg-gradient-to-b from-[#1A1D1F] to-[#2A2D2F]'>
      <NavBar />
      
      {/* Hero Section */}
      <div className='container mx-auto px-4 pt-20 pb-32'>
        <div className='max-w-4xl mx-auto text-center space-y-6'>
          <h1 className='text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text'>
            Empowering Creators & Rewarding Fans
          </h1>
          <p className='text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto'>
            Join the next generation of content creation. Access exclusive posts, videos, and experiences from your favorite creators.
          </p>
          <Link href='/passes'>
            <button className='mt-8 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg'>
              Explore Passes
            </button>
          </Link>
        </div>
      </div>

      {/* Cards Section */}
      <div className='relative max-w-6xl mx-auto px-4 -mt-20'>
        <div className='flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4'>
          {/* Card 1 */}
          <div className='hidden md:block transform -rotate-12 hover:rotate-0 transition-all duration-300'>
            <AccessCard
              image="/two.jpeg"
              name="Josh Daniel"
              className="bg-gradient-to-r from-blue-400 to-purple-500"
            />
          </div>

          {/* Main Card */}
          <div className='transform scale-105 hover:scale-110 transition-all duration-300 z-10'>
            <AccessCard
              image="/smile.jpg"
              name="Justina Kate"
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            />
          </div>

          {/* Card 3 */}
          <div className='hidden md:block transform rotate-12 hover:rotate-0 transition-all duration-300'>
            <AccessCard
              image="/three.jpeg"
              name="Kelvin Jones"
              className="bg-gradient-to-r from-blue-400 to-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className='container mx-auto px-4 py-32'>
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
          <FeatureCard
            icon={<FaUnlockKeyhole className="text-4xl" />}
            title="Unlock the Future"
            description="Revolutionary content creation and sharing platform"
          />
          <FeatureCard
            icon={<FaBridgeCircleCheck className="text-4xl" />}
            title="Bridge Connections"
            description="Direct creator-to-fan relationships and experiences"
          />
          <FeatureCard
            icon={<SiFueler className="text-4xl" />}
            title="Fuel Creativity"
            description="Innovative tools for content creators to thrive"
          />
          <FeatureCard
            icon={<RiVipCrown2Fill className="text-4xl" />}
            title="Premium Experience"
            description="Exclusive content and unique fan experiences"
          />
        </div>
      </div>

      <Footer />
    </div>
  )
}

const AccessCard = ({ image, name, className }: AccessCardProps) => (
  <div className={`w-[300px] rounded-2xl overflow-hidden shadow-2xl ${className}`}>
    <div className='p-6 text-center'>
      <Image height={45} width={45} src='/sol.png' alt='sol' className='mx-auto' />
      <p className='font-cursive text-2xl text-white font-bold mt-4'>Access Card</p>
    </div>
    <div className='bg-slate-800 p-6 space-y-4'>
      <Image src='/whiteLogo.png' alt='logo' height={10} width={60} className='w-24 mx-auto' />
      <Image src={image} className='rounded-lg w-full h-48 object-cover' height={70} width={150} alt='profile' />
      <div className='flex items-center justify-center gap-3'>
        <RiHeart2Line className='text-white' />
        <p className='font-mono text-white font-bold'>{name}</p>
        <RiHeart2Line className='text-white' />
      </div>
    </div>
  </div>
)

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className='bg-[#232629] border border-blue-500/30 p-8 rounded-xl hover:border-blue-500 transition-colors duration-300'>
    <div className='text-blue-400 mb-4'>{icon}</div>
    <h3 className='text-xl font-bold text-white mb-2'>{title}</h3>
    <p className='text-gray-300'>{description}</p>
  </div>
)

export default Page
