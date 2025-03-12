'use client'
import { FC, useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { FaCopy } from "react-icons/fa";
import { GiFlowerPot } from "react-icons/gi";
import { FaCar } from "react-icons/fa";
import { FaLaptopHouse } from "react-icons/fa";
import { Profile } from '@/types/creator';


/*
In main.tsx, once a user owns a pass... disable the button to create that same pass tier with a 'not allowed' icon.  Add a checkbox that says, i upload 18+ content in the profileUpload.tsx meaning you have to adjust the API route and databaase data structure  in creators route, add a bold red +18 icon under the creator card details for users that upload +18 contents and also add their country of origin  I want to be able to upload videos also, look at the cloudinary files and also adjust the posts in content.tsx and creator/[id]/page.tsx to handle both image and video

*/
interface GiftModalProps {
    profile: Profile | null;
    creatorId: string;
    onClose: () => void;
    onSendTx: (amount: number, receiver: string) => Promise<void>;
    onBuySol: () => void;
}

const GiftModal: FC<GiftModalProps> = ({ profile, creatorId, onClose, onSendTx, onBuySol }) => {
    const [copySuccess, setCopySuccess] = useState(false);
    const [selectedGift] = useState({
        flower: 20000000,
        car: 100000000,
        house: 1000000000
    });

    const handleCopyAddress = async () => {
        try {
            await navigator.clipboard.writeText(creatorId);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy address:', err);
        }
    };

    return (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50'>
            <div className='bg-[#1A1D1F] rounded-lg p-6 md:w-[400px] w-[95%] relative shadow-xl'>
                <button
                    onClick={onClose}
                    className='absolute top-4 right-4 text-gray-400 hover:text-white transition-colors'
                >
                    <IoMdClose size={24} />
                </button>

                <h2 className='text-white text-xl font-bold mb-6'>Gift {profile?.username}</h2>

                <div className='space-y-4'>
                    <div className='flex flex-col gap-y-2'>
                        <p className='text-gray-400 text-sm'>This creator address can receive SOL:</p>
                        <div className='flex items-center gap-x-2'>
                            <p className='text-gray-200 font-mono bg-[#111315] p-2 rounded flex-1 overflow-x-auto'>
                                {creatorId}
                            </p>
                            <button
                                onClick={handleCopyAddress}
                                className='bg-blue-600 p-2 rounded hover:opacity-90 transition-opacity'
                            >
                                <FaCopy className='text-white' />
                            </button>
                        </div>
                        {copySuccess && (
                            <p className='text-green-500 text-sm'>Address copied!</p>
                        )}
                    </div>
                   
                    <div className='text-center text-gray-400 text-sm'>Send SOL directly to this creator</div>
                    <div className='flex my-2 items-center justify-center gap-x-8'>
                        <button 
                            onClick={() => onSendTx(selectedGift.flower, creatorId)} 
                            className='flex items-center shadow-lg justify-evenly flex-col gap-y-2 border border-white text-white p-3 rounded-lg bg-black hover:opacity-90 transition-opacity'
                        >
                            <p className='text-[0.8rem]'>{selectedGift.flower / 1000000000} SOL</p>
                            <GiFlowerPot className='text-[1.5rem]' />
                            <p className='text-[0.8rem]'>Send flower</p>
                        </button>

                        <button 
                            onClick={() => onSendTx(selectedGift.car, creatorId)}
                            className='flex items-center shadow-lg justify-center flex-col gap-y-2 text-white p-3 border border-white rounded-lg bg-black hover:opacity-90 transition-opacity'
                        >
                            <p className='text-[0.8rem]'>{selectedGift.car / 1000000000} SOL</p>
                            <FaCar className='text-[1.5rem]' />
                            <p className='text-[0.8rem]'>Send car</p>
                        </button>

                        <button 
                            onClick={() => onSendTx(selectedGift.house, creatorId)}
                            className='flex shadow-lg items-center justify-center flex-col gap-y-2 text-white p-3 rounded-lg bg-black border border-white hover:opacity-90 transition-opacity'
                        >
                            <p className='text-[0.8rem]'>{selectedGift.house / 1000000000} SOL</p>
                            <FaLaptopHouse className='text-[1.5rem]' />
                            <p className='text-[0.8rem]'>Send house</p>
                        </button>
                    </div>

                    <div className='text-center text-gray-400 text-sm'>Easily upgrade SOL balance if low</div>
                    <button
                        onClick={onBuySol}
                        className='bg-black border border-white text-white px-4 py-2 rounded-lg w-full hover:opacity-90 transition-opacity'
                    >
                        BUY SOL
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GiftModal;
