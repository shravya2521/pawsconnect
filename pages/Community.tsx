import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, X, Camera, Trash2, Image, Send, Plus } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0NDQ0NDQyI+PHBhdGggZD0iTTEyIDJDNi40NyAyIDIgNi40NyAyIDEyczQuNDcgMTAgMTAgMTAgMTAtNC40NyAxMC0xMFMxNy41MyAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4em0tMTJjLTIuMjEgMC00IDEuNzktNCA0czEuNzkgNCA0IDQgNC0xLjc5IDQtNC0xLjc5LTQtNHptMCAxMGMtMy4zMSAwLTYgMS42OS02IDIuNzV2MS4yNWg2di0yLjc1YzAtMS4xMDYtMi42OS0yLjc1LTYtMi43NXoiLz48L3N2Zz4=';

interface Post {
  id: number;
  content: string;
  image_url: string | null;
  author: string;
  author_name: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  timestamp: string;
  user_type: 'admin' | 'center';
  user_id: number;
}

interface Comment {
  id: number;
  author: string;
  avatar_url: string;
  content: string;
  timestamp: string;
}

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]); // Initialize with empty array instead of initialPosts
  const [showComments, setShowComments] = useState(false);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState('');
  const [postComments, setPostComments] = useState<{ [key: number]: Comment[] }>({});
  const [newPost, setNewPost] = useState({
    content: '',
    image: ''
  });
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const userType = localStorage.getItem('userType');
  const userId = userType === 'admin' ? 
    localStorage.getItem('adminId') : 
    userType === 'center' ?
    localStorage.getItem('centerId') :
    localStorage.getItem('customerId'); // Add customer ID retrieval
  const isAdmin = userType === 'admin';

  const fetchPosts = async () => {
    try {
      const response = await fetch(
        encodeURI(`https://pawsconnect.rf.gd/get_community_posts.php?user_id=${userId}&user_type=${userType}`), 
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      if (result.status === 'success' && Array.isArray(result.data)) {
        setPosts(result.data);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const response = await fetch(encodeURI('https://pawsconnect.rf.gd/delete_post.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ id: postId })
      });
      const data = await response.json();
      if (data.status === 'success') { // Changed from data.success
        await fetchPosts(); // Refresh posts after deletion
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Error deleting post. Please try again.');
    }
  };

const fetchComments = async (postId: number) => {
    try {
        const response = await fetch(encodeURI(`https://pawsconnect.rf.gd/get_comments.php?postId=${postId}`), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        if (data.status === 'success') {
            setPostComments(prev => ({
                ...prev,
                [postId]: data.comments
            }));
        }
    } catch (err) {
        console.error('Error fetching comments:', err);
    }
};

const handleComment = async (post: Post) => {
    setActivePost(post);
    setShowComments(true);
    await fetchComments(post.id); // Remove the recursive call
    setTimeout(() => {
        commentInputRef.current?.focus();
    }, 100);
};

  const handleDeleteComment = async (postId: number, commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
        const response = await fetch(encodeURI('https://pawsconnect.rf.gd/delete_comment.php'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ id: commentId })
        });
        
        const data = await response.json();
        if (data.status === 'success') {
            await Promise.all([
                fetchComments(postId),
                fetchPosts()
            ]);
        } else {
            throw new Error(data.message || 'Failed to delete comment');
        }
    } catch (err) {
        console.error('Error deleting comment:', err);
        alert('Failed to delete comment. Please try again.');
    }
};

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activePost) return;

    try {
        const commentData = {
            post_id: activePost.id,
            user_id: userId,
            user_type: userType, // Make sure this is included
            content: newComment
        };

        console.log('Sending comment data:', commentData); // Debug log

        const response = await fetch('https://pawsconnect.rf.gd/add_comment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(commentData)
        });

        const data = await response.json();
        if (data.status === 'success') {
            await Promise.all([
                fetchComments(activePost.id),
                fetchPosts()
            ]);
            setNewComment('');
        } else {
            throw new Error(data.message || 'Failed to add comment');
        }
    } catch (err) {
        console.error('Error adding comment:', err);
        alert('Failed to add comment. Please try again.');
    }
};

const handleLike = async (postId: number) => {
    try {
        const response = await fetch(encodeURI('https://pawsconnect.rf.gd/toggle_like.php'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                post_id: postId,
                user_id: userId,
                user_type: userType
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.status === 'success') {
            setPosts(currentPosts =>
                currentPosts.map(post =>
                    post.id === postId
                        ? {
                            ...post,
                            likes: data.likeCount,
                            isLiked: data.isLiked
                        }
                        : post
                )
            );
        } else {
            throw new Error(data.message || 'Failed to toggle like');
        }
    } catch (err) {
        console.error('Error toggling like:', err);
        // Fetch fresh data on error
        await fetchPosts();
    }
};

  const handleShare = (post: Post) => {
    if (!isAdmin) {
      alert('Share functionality coming soon!');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;

    const formData = new FormData();
    formData.append('content', newPost.content);
    formData.append('user_id', userId || '0');
    formData.append('user_type', userType || '');

    try {
      if (fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size must be less than 5MB');
          return;
        }
        formData.append('image', file);
      }

      const response = await fetch('https://pawsconnect.rf.gd/add_post.php', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.status === 'success') {
        await fetchPosts();
        setNewPost({ content: '', image: '' });
        setPreviewImage(null);
        setShowNewPostModal(false);
      } else {
        throw new Error(data.message || 'Failed to create post');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Failed to create post. Please try again.');
    }
  };

const renderPostImage = (post: any) => {
    if (!post.image_url) return null;
    
    // Already in base64 format from the database
    const imageUrl = `data:image/jpeg;base64,${post.image_url}`;
    return (
        <img 
            src={imageUrl}
            alt="Post"
            className="w-full h-[500px] object-cover rounded-lg mb-6"
            onError={(e) => {
                console.error('Error loading image');
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBsb2FkIGVycm9yPC90ZXh0Pjwvc3ZnPg==';
            }}
        />
    );
};

const renderAvatar = (post: any) => {
    if (post.avatar_url) {
        return `data:image/jpeg;base64,${post.avatar_url}`;
    }
    return DEFAULT_AVATAR;
};

// Replace the existing useEffect with a simpler version
  useEffect(() => {
    fetchPosts();
  }, []); // Only fetch once on mount

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Create Post Button - Fixed at top */}
        <div className="sticky top-0 z-10 bg-gray-50 pb-4">
          <button
            onClick={() => setShowNewPostModal(true)}
            className="w-full bg-white rounded-lg shadow-md p-6 text-left text-gray-500 hover:bg-gray-50 transition duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <Camera size={24} />
              </div>
              <span className="text-lg">Share your pet story...</span>
            </div>
          </button>
        </div>

        {/* Scrollable Posts Container */}
        <div className="space-y-8 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">  {/* Increased padding */}
                <div className="flex items-center justify-between mb-6">  {/* Increased margin */}
                  <div className="flex items-center gap-4">  {/* Increased gap */}
                    <img 
                      src={renderAvatar(post)}
                      alt={post.author} 
                      className="w-12 h-12 rounded-full object-cover bg-gray-100" 
                    />
                    <div>
                      <h3 className="text-lg font-semibold">{post.author}</h3>  {/* Larger text */}
                      <p className="text-sm text-gray-500">{post.timestamp}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-500 hover:text-red-600"
                      title="Delete post"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
                <p className="mb-6 text-lg">{post.content}</p>  {/* Larger text and margin */}
                {post.image_url && renderPostImage(post)}
                <div className="flex items-center gap-6 text-gray-600">
                  <button
                    className={`flex items-center gap-2 hover:text-indigo-600 transition-colors ${
                      post.isLiked ? 'text-indigo-600' : ''
                    }`}
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart size={20} fill={post.isLiked ? 'currentColor' : 'none'} />
                    <span>{post.likes}</span>
                  </button>
                  <button
                    className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                    onClick={() => handleComment(post)}
                  >
                    <MessageCircle size={20} />
                    <span>{post.comments}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Post Modal */}
        {showNewPostModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-[500px] overflow-hidden">
              {/* Header - Fixed */}
              <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                <h3 className="text-xl font-semibold">Create Post</h3>
                <button
                  onClick={() => {
                    setShowNewPostModal(false);
                    setNewPost({ content: '', image: '' });
                    setPreviewImage(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Wrap entire content in form */}
              <form onSubmit={handleCreatePost}>
                {/* Scrollable Container */}
                <div className="h-[300px] overflow-y-auto overflow-x-hidden p-6">
                  <div className="space-y-4">
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      placeholder="Share your pet story..."
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-[150px] min-h-[150px] max-h-[150px] overflow-y-scroll resize-none scrollbar scrollbar-thumb-gray-400 scrollbar-track-gray-100"
                      required
                    />
                    {previewImage && (
                      <div className="relative">
                        <img 
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-[200px] object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewImage(null)}
                          className="absolute top-2 right-2 bg-gray-800 text-white p-1 rounded-full hover:bg-gray-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls - Fixed */}
                <div className="p-4 border-t bg-white sticky bottom-0">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
                    >
                      <Image size={20} />
                      Add Photo
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center gap-2"
                    >
                      <Send size={20} />
                      Post
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Comments Modal */}
        {showComments && activePost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-xl font-semibold">Comments</h3>
                <button
                  onClick={() => setShowComments(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {(postComments[activePost.id] || []).map((comment) => (
                  <div key={comment.id} className="flex gap-3 mb-4">
                    <img 
                      src={comment.avatar_url 
                        ? `data:image/jpeg;base64,${comment.avatar_url}` 
                        : DEFAULT_AVATAR}
                      alt={comment.author}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{comment.author}</span>
                          <span className="text-sm text-gray-500">{comment.timestamp}</span>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteComment(activePost.id, comment.id)}
                            className="text-red-500 hover:text-red-600"
                            title="Delete comment"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t">
                <form onSubmit={handleSubmitComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    ref={commentInputRef}
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
      <button
        onClick={() => setShowNewPostModal(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}