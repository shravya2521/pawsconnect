import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, Flag, MessageSquare } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface Post {
  id: number;
  content: string;
  image_url: string;
  status: 'active' | 'deleted';
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_liked_by_admin: boolean;
}

export default function AdminCommunity() {
  const [posts, setPosts] = useState<Post[]>([]);
  const navigate = useNavigate();
  const adminId = localStorage.getItem('adminId');

  useEffect(() => {
    if (!adminId) {
      navigate('/login');
      return;
    }
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('https://pawsconnect.rf.gd/get_community_posts.php');
      const data = await response.json();
      if (data.status === 'success') {
        setPosts(data.data);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const response = await fetch('https://pawsconnect.rf.gd/toggle_post_like.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, admin_id: adminId })
      });
      const data = await response.json();
      if (data.success) {
        fetchPosts(); // Refresh posts after like/unlike
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await fetch('https://pawsconnect.rf.gd/delete_post.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId })
      });
      const data = await response.json();
      if (data.success) {
        fetchPosts();
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Community Management</h1>
        
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
              {post.image_url && (
                <img 
                  src={post.image_url} 
                  alt="Post content" 
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
              <p className="text-gray-800 mb-4">{post.content}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 ${
                      post.is_liked_by_admin ? 'text-red-500' : 'text-gray-500'
                    }`}
                  >
                    <Heart size={20} fill={post.is_liked_by_admin ? "currentColor" : "none"} />
                    <span>{post.likes_count}</span>
                  </button>
                  
                  <div className="flex items-center gap-2 text-gray-500">
                    <MessageSquare size={20} />
                    <span>{post.comments_count}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => navigate(`/admin/reports?postId=${post.id}`)}
                    className="text-orange-500 hover:text-orange-600"
                  >
                    <Flag size={20} />
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
