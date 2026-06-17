import React, { useState, useEffect } from 'react';
import { 
  Users, MessageSquare, Heart, Send, Sparkles, 
  HelpCircle, UserCheck, Flame, Plus, ChevronDown, RefreshCw 
} from 'lucide-react';
import { DiscussionPost } from '../types';

interface CommunityViewProps {
  currentUsername: string;
  avatar: string;
  currentUserEmail?: string;
}

export default function CommunityView({ currentUsername, avatar, currentUserEmail }: CommunityViewProps) {
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [replyInputs, setReplyInputs] = useState<{ [posId: string]: string }>({});

  const SUBJECTS = [
    'Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government'
  ];

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/discussions');
      if (resp.ok) {
        const data = await resp.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Failed to sync forum posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      const resp = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: currentUsername,
          avatar,
          content: newPostContent,
          subject: selectedSubject,
          author_email: currentUserEmail || `${currentUsername.toLowerCase().trim()}@waecmaster.edu.ng`
        })
      });

      if (resp.ok) {
        setNewPostContent('');
        fetchPosts();
      }
    } catch (err) {
      console.error('Failed to dispatch forum post:', err);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const resp = await fetch(`/api/discussions/${postId}/like`, { method: 'POST' });
      if (resp.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error('Failed to submit post like:', err);
    }
  };

  const handleAddReply = async (postId: string) => {
    const rContent = replyInputs[postId];
    if (!rContent || !rContent.trim()) return;

    try {
      const resp = await fetch(`/api/discussions/${postId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: currentUsername,
          avatar,
          content: rContent
        })
      });

      if (resp.ok) {
        setReplyInputs(prev => ({ ...prev, [postId]: '' }));
        fetchPosts();
      }
    } catch (err) {
      console.error('Failed to submit post reply:', err);
    }
  };

  return (
    <div id="community-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* LEFT COLUMN: ACTIVE FEED */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Create new post workspace */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-slate-900 text-sm">Post to the General study Board</h3>
          
          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              required
              rows={3}
              placeholder="Ask a WAEC syllabus question, or share a study trick with classmates..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl py-3 px-4 text-xs focus:outline-hidden resize-none"
            />

            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-semibold text-3xs uppercase block tracking-wider shrink-0">Subject Category:</span>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-slate-100 border border-slate-200 rounded-xl py-1.5 px-3 text-2xs focus:outline-hidden text-slate-800"
                >
                  {SUBJECTS.map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition duration-150 cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                Publish Post <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* FEED LIST */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-display font-bold text-slate-500 uppercase tracking-wider text-xs">A1 Study Discussions</h4>
            <button 
              onClick={fetchPosts}
              className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
              title="Refresh discussion feeds"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading && posts.length === 0 ? (
            <div className="flex justify-center py-12">
              <span className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-150 text-center space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
              <h5 className="font-bold text-slate-800 text-sm">All is Quiet</h5>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">Be the first premier student to post a diagnostic study query or general exam timetables updates!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  
                  {/* Author metadata */}
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={post.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} 
                        alt="author avatar" 
                        className="w-9 h-9 rounded-xl border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs">{post.author}</h5>
                        <p className="text-[10px] text-slate-400">Published {new Date(post.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>

                    <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-2.5 py-1 rounded-full shrink-0">
                      {post.subject}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed max-w-xl">
                    {post.content}
                  </p>

                  {/* Actions bar */}
                  <div className="flex gap-4 border-y border-slate-100 py-2 items-center text-xs text-slate-500">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className="flex items-center gap-1.5 hover:text-red-500 font-bold cursor-pointer transition select-none"
                    >
                      <Heart className="w-4 h-4 text-red-400" />
                      {post.likes} Upvotes
                    </button>
                    <span className="flex items-center gap-1.5 font-bold">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      {post.replies?.length || 0} Responses
                    </span>
                  </div>

                  {/* REPLIES TIMELINE */}
                  {post.replies && post.replies.length > 0 && (
                    <div className="space-y-3 pt-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                      {post.replies.map((rep) => (
                        <div key={rep.id} className="flex gap-2.5 border-b border-slate-200/50 pb-2.5 last:border-b-0 last:pb-0">
                          <img
                            src={rep.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                            alt="avatar"
                            className="w-7 h-7 rounded-lg shrink-0 border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <div className="grow">
                            <div className="flex justify-between items-baseline mb-0.5">
                              <span className="font-bold text-slate-800">{rep.author}</span>
                              <span className="text-[9px] text-slate-400">{new Date(rep.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-slate-600 leading-normal">{rep.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* WRITE REPLY INPUT */}
                  <div className="relative flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Write a helpful response..."
                      value={replyInputs[post.id] || ''}
                      onChange={(e) => setReplyInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddReply(post.id);
                      }}
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl py-2 pl-3 pr-10 hover:border-slate-350 focus:outline-hidden text-xs"
                    />
                    <button
                      onClick={() => handleAddReply(post.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: REVISION GROUPS AND TOP SCHOLARS */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Recommended Revision Study clubs */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-display font-bold text-slate-900 text-sm">WAEC Revision Circles</h3>
          <p className="text-2xs text-slate-500">Collaborative groups preparing dynamically for targeted regional sections.</p>

          <div className="space-y-3">
            {[
              { title: 'Lagos Maths Wizards', count: 142, emoji: '⚡' },
              { title: 'Accra Chemistry Lab', count: 98, emoji: '🧪' },
              { title: 'Kano Economics Club', count: 77, emoji: '🦁' },
              { title: 'Freetown Literature Hub', count: 48, emoji: '📖' }
            ].map((club, idx) => (
              <div 
                key={idx} 
                className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between transition hover:border-slate-300"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg bg-white p-1 rounded-lg border border-slate-150/50">{club.emoji}</span>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">{club.title}</h5>
                    <p className="text-3xs text-slate-400">{club.count} candidates active</p>
                  </div>
                </div>

                <button 
                  onClick={() => {}}
                  className="p-1 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-3xs font-bold transition cursor-pointer"
                >
                  Join Circle
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Motivating advice */}
        <div className="bg-slate-950 text-white p-6 rounded-3xl shadow-xl space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl translate-x-4 -translate-y-4"></div>
          
          <div className="flex gap-2 items-center">
            <Sparkles className="text-amber-400 w-5 h-5" />
            <span className="font-display font-bold text-white text-xs uppercase tracking-widest">A1 candidate Oath</span>
          </div>
          <p className="text-2xs text-slate-400 leading-relaxed italic">
            "We do not study simply to pass; we study to command our destinies. Parallel A1 results are forged in late-night sessions and collaborative group help."
          </p>
          <span className="text-3xs text-slate-500 block text-right font-mono">— FGC Enugu Candidate Chapter</span>
        </div>
      </div>
    </div>
  );
}
