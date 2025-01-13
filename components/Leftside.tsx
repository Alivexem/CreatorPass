import Link from 'next/link'
import Image from 'next/image'
const SideNav = () => {
    return (
    <div style={{
        background: 'linear-gradient(93.1deg, #6d2baa 0%, #682E9E 98.22%)'
    }} className='md:h-[97vh] h-[100vh] w-[100%] px-10 pb-5 relative md:rounded-lg text-white box-border p-10 flex flex-col md:items-start'>
            <div className='flex items-center justify-between w-full space-x-4'>
                <Image src='/whiteLogo.png' alt='logo' height={30} width={150} />
                <Link href='/'><button className='bg-[#cbd5e1] lg:h-[45px] h-[35px] text-[0.8rem] lg:text-[0.9rem] w-[100px] lg:w-[150px] text-black hover:bg-transparent hover:text-white border-[1px] rounded-[40px] border-[#cbd5e1]'>
                   <span className='hidden lg:inline'>Vibe</span>
                   <span className='lg:hidden'>Vibe</span>
                </button></Link>
            </div> 
            <div className='flex justify-center flex-col items-center absolute bottom-20 md:bottom-10 left-1/2 transform -translate-x-1/2'>
            <div className='flex flex-col justify-center items-center'>
                    <p className='text-white text-center w-[100%] md:text-[28px] lg:text-[32px] text-[32px] whitespace-nowrap'>
                    Reward creators with passes,
                    </p>
                    <p className='text-white text-center w-[100%] md:text-[28px] lg:text-[32px] text-[32px]'>
                    tailored to their community.
                    </p>

                </div>
                <div className='w-[150px] flex items-center justify-evenly mt-5'>
                    <div className='w-[40px] h-[6px] border-none bg-[#1A1D1F] rounded-sm'></div>
                    <div className='w-[40px] h-[6px] border-none bg-white rounded-sm'></div>
                    <div className='w-[40px] h-[6px] border-none bg-white rounded-sm'></div>
                </div>

                <Link href='/signup'> <button className='w-[116px] hover:bg-green-800 mt-[40px] h-[45px] text-[#ffffff] bg-[#1ab479] rounded-[45px] md:hidden'>Get started</button></Link>
            </div>
        </div>
    )
}

export default SideNav
