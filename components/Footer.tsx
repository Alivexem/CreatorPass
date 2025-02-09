import React from 'react'
import Image from 'next/image'
import { FaGithub, FaTwitter, FaEnvelope } from "react-icons/fa";
import { IoTicketSharp } from "react-icons/io5";

const Footer = () => {
    return (
        <div className='mt-[100px] bg-black w-full min-h-[200px] text-white hidden md:flex flex-col justify-center items-center p-8'>
            <div className='max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8'>
                {/* Brand Section */}
                <div className='flex flex-col items-center md:items-start gap-y-3'>
                    <Image src='/whiteLogo.png' alt='logo' height={30} width={150} />
                    <p className='text-gray-300 text-sm max-w-[250px] text-center md:text-left'>
                        A decentralized social platform connecting content creators to fans through blockchain technology
                    </p>
                </div>

                {/* Quick Links */}
                <div className='flex flex-col items-center gap-y-3'>
                    <h3 className='text-lg font-bold mb-2'>Platform Features</h3>
                    <div className='flex flex-col items-center gap-y-2 text-gray-300 text-sm'>
                        <p>Creator Profiles</p>
                        <p>Content Sharing</p>
                        <p>SOL Tipping</p>
                        <p>NFT Access Passes</p>
                    </div>
                </div>

                {/* Contact Info */}
                <div className='flex flex-col items-center md:items-end gap-y-3'>
                    <h3 className='text-lg font-bold mb-2'>Connect With Us</h3>
                    <div className='flex gap-x-4'>
                        <a href="https://github.com/alivexem" target="_blank" rel="noopener noreferrer" 
                           className='hover:text-purple-500 transition-colors'>
                            <FaGithub size={24} />
                        </a>
                        <a href="https://x.com/alivexem" target="_blank" rel="noopener noreferrer"
                           className='hover:text-purple-500 transition-colors'>
                            <FaTwitter size={24} />
                        </a>
                        <a href="mailto:athkinstestimony@gmail.com"
                           className='hover:text-purple-500 transition-colors'>
                            <FaEnvelope size={24} />
                        </a>
                    </div>
                    <p className='text-gray-300 text-sm mt-2'>athkinstestimony@gmail.com</p>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className='w-full max-w-6xl border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-y-4'>
                <p className='text-gray-400 text-sm'>© 2025 CreatorPass. Designed & Developed by Athkins</p>
                <div className='flex items-center gap-x-2 text-purple-500'>
                    <IoTicketSharp size={20} />
                    <p className='text-sm'>Powered by Solana</p>
                </div>
            </div>
        </div>
    )
}

export default Footer
