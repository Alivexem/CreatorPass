import { FaInfoCircle } from "react-icons/fa";
import { Pass } from "@/types/pass";

export const PassInfo = ({ pass }: { pass: Pass }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowInfo(true)}
        className="text-gray-400 hover:text-white transition-colors"
      >
        <FaInfoCircle size={20} />
      </button>

      {showInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">{pass.category} Pass Details</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-gray-300 font-medium mb-2">Pass Message</h4>
                <p className="text-white">{pass.cardTag}</p>
              </div>

              <div>
                <h4 className="text-gray-300 font-medium mb-2">Access Rules</h4>
                <ul className="space-y-2 text-white">
                  <li>Chat Access: {pass.rules.allowChat === 'silver' ? 'Silver & Above' : 
                    pass.rules.allowChat === 'all' ? 'All Pass Holders' : 'No Chat Access'}</li>
                  <li>Interactions: {pass.rules.allowInteractions === 'bronze' ? 'Bronze & Above' : 
                    pass.rules.allowInteractions === 'all' ? 'All Pass Holders' : 'No Access'}</li>
                  <li>Downloads: {pass.rules.allowDownload === 'bronze' ? 'Bronze & Above' : 
                    pass.rules.allowDownload === 'all' ? 'All Pass Holders' : 'No Access'}</li>
                  <li>Gifting: Available to all</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}; 