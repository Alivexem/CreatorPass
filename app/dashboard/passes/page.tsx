'use client'
import { useState } from 'react';

interface PassRule {
  canComment: boolean;
  canLike: boolean;
  canDownload: boolean;
  canChat: boolean;
  canViewExclusive: boolean;
  canGift: boolean;
}

const [passRules, setPassRules] = useState<PassRule>({
  canComment: false,
  canLike: false,
  canDownload: false,
  canChat: false,
  canViewExclusive: false,
  canGift: false,
});

<div className="space-y-4 mt-4 p-4 bg-gray-800 rounded-lg">
  <h3 className="text-white font-semibold mb-2">Pass Rules</h3>
  <div className="grid grid-cols-2 gap-4">
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={passRules.canComment}
        onChange={(e) => setPassRules(prev => ({...prev, canComment: e.target.checked}))}
        className="form-checkbox text-purple-600"
      />
      <span className="text-gray-300">Can Comment</span>
    </label>
    {/* Add other checkboxes similarly */}
  </div>
</div> 