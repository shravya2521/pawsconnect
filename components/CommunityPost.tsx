import React from 'react';
import { User } from 'lucide-react';

interface PostProps {
  post: {
    id: number;
    content: string;
    user_name: string;
    user_type: 'admin' | 'center' | 'customer';
    profile_picture: string | null;
    formatted_date: string;
  };
}

const CommunityPost: React.FC<PostProps> = ({ post }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-shrink-0">
          {post.profile_picture ? (
            <img
              src={`data:image/jpeg;base64,${post.profile_picture}`}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
          )}
        </div>
        <div>
          <h3 className={`font-semibold ${post.user_type === 'admin' ? 'text-red-600' : 'text-gray-900'}`}>
            {post.user_name}
          </h3>
          <p className="text-sm text-gray-500">{post.formatted_date}</p>
        </div>
      </div>
      
      {/* ...existing content rendering code... */}
    </div>
  );
};

export default CommunityPost;
