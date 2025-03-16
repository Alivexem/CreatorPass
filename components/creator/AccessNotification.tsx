import { RiErrorWarningLine } from "react-icons/ri";

interface AccessNotificationProps {
    show: boolean;
    message: string;
    onClick: () => void;
}

const AccessNotification = ({ show, message, onClick }: AccessNotificationProps) => {
    if (!show) return null;

    return (
        <div 
            onClick={onClick}
            className="bg-gradient-to-r md:left-[35vw] absolute mt-[120px] md:mt-[130px] from-purple-600 my-5 to-purple-500 text-white px-6 py-3 rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity text-center w-auto mx-4"
        >
            <p className='text-[1rem] flex items-center text-left'>
                <RiErrorWarningLine className='text-white mr-2' />
                {message}
            </p>
        </div>
    );
};

export default AccessNotification;
