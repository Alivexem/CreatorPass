'use client'
import Link from 'next/link'
import {useState, useEffect} from 'react'   
import Image from 'next/image'
const SideNav = () => {
    const texts = [
        {
            line1: "Reward creators with passes,",
            line2: "tailored to their community."
        },
        {
            line1: "Build engaged communities,",
            line2: "with exclusive access."
        },
        {
            line1: "Create meaningful connections,",
            line2: "through digital passes."
        }
    ];

    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTextIndex((prevIndex:number) => (prevIndex + 1) % texts.length);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
    <div style={{
        backgroundImage: 'url(/gifimage.gif)', objectFit: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'
    }} className='h-[100vh] w-[100%] px-10 pb-5 relative text-white box-border p-10 flex flex-col md:items-start'>
            <div className='flex items-center justify-between w-full space-x-4'>
                <Image style={{borderRadius: '50%'}} className='rounded-[50%]' src='/crtp.jpg' alt='logo' height={50} width={50} />
                <Link href='/'><button className='bg-[#cbd5e1] cursor-text lg:h-[45px] h-[35px] text-[0.8rem] lg:text-[0.9rem] w-[100px] lg:w-[150px] text-black border-[1px] rounded-[40px] border-[#cbd5e1]'>
                   <span className='linline'>Welcome</span>
           
                </button></Link>
            </div> 

            {/* <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                <Image 
                    src='/gifimage.gif' 
                    className='rounded-lg' 
                    alt='aiwoman' 
                    height={250} 
                    width={250}
                    style={{
                        animation: 'lightPulse 3s infinite'
                    }}
                />
                <style jsx global>{`
                    @keyframes lightPulse {
                        0% {
                            opacity: 1;
                        }
                        50% {
                            opacity: 0.7;
                        }
                        100% {
                            opacity: 1;
                        }
                    }
                `}</style>
            </div> */}
            <div className='flex justify-center flex-col items-center absolute bottom-10 md:bottom-5 left-1/2 transform -translate-x-1/2'>
            <div className='flex flex-col justify-center items-center relative h-[120px] overflow-hidden'>
                <div className='relative w-full z-10'>
                    <div className='slide-content'>
                        <p className='text-white text-center w-[100%] md:text-[25px] lg:text-[25px] text-[32px] whitespace-nowrap'>
                            {texts[currentTextIndex].line1}
                        </p>
                        <p className='text-white text-center w-[100%] md:text-[25px] lg:text-[25px] text-[32px]'>
                            {texts[currentTextIndex].line2}
                        </p>
                    </div>
                </div>
            </div>
            <div className='w-[150px] flex items-center justify-evenly mt-2'>
                {texts.map((_, index) => (
                    <div 
                        key={index}
                        className={`w-[40px] h-[6px] border-none transition-colors duration-500 rounded-sm ${
                            index === currentTextIndex ? 'bg-white' : 'bg-black'
                        }`}
                    ></div>
                ))}
            </div>
            <style jsx>{`
                .slide-content {
                    height: 120px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    position: relative;
                    width: 100%;
                    z-index: 20;
                }
            `}</style>

                <Link href='/signup'> <button className='w-[116px] hover:bg-green-800 mt-[40px] h-[45px] text-[#ffffff] bg-[#1ab479] rounded-[45px] md:hidden'>Get started</button></Link>
            </div>
        </div>
    )
}

export default SideNav
