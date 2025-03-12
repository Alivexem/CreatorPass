import { useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { FaCopy, FaCar } from "react-icons/fa";
import { GiFlowerPot } from "react-icons/gi";
import { FaLaptopHouse } from "react-icons/fa";
import { Profile } from '@/types/creator';

interface GiftModalProps {
    profile: Profile | null;
    creatorId: string;
    onClose: () => void;
    onSendTx: (amount: number, receiver: string) => Promise<void>;
    onBuySol: () => void;
}

const GiftModal = ({ profile, creatorId, onClose, onSendTx, onBuySol }: GiftModalProps) => {
    const [copySuccess, setCopySuccess] = useState(false);
    const selectedGift = {
        flower: 20000000,
        car: 100000000,
        house: 1000000000
    };

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
            {/* ...existing modal code... */}
        </div>
    );
};

export default GiftModal;
