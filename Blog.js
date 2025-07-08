import React, { useState } from 'react';
import './Blog.css';

const demoBlogs = [
  {
    id: 1,
    title: '5 Tips to Boost Your Study Productivity',
    author: 'Admin',
    authorAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    date: 'July 6, 2025',
    excerpt: 'Discover actionable tips to make your study sessions more effective and enjoyable.',
    content: `Studying can be tough, but with the right strategies, you can make it much more productive. Here are 5 tips to help you get started:\n\n1. Set clear goals for each session.\n2. Take regular breaks (Pomodoro technique).\n3. Minimize distractions (put your phone away!).\n4. Use active recall and spaced repetition.\n5. Collaborate with peers for group learning.\n\nTry these out and see your productivity soar!`,
    image: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=600&q=80',
    tags: ['Productivity', 'Tips', 'Study']
  },
  {
    id: 2,
    title: 'Why Collaboration is Key in Learning',
    author: 'Jane Doe',
    authorAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    date: 'July 2, 2025',
    excerpt: 'Learn how working with others can help you understand concepts better and stay motivated.',
    content: `Collaboration allows you to see problems from different perspectives, learn faster, and stay motivated. Don\'t hesitate to join a study group or ask questions in your community!`,
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
    tags: ['Collaboration', 'Motivation']
  },
  {
    id: 3,
    title: 'Top Free Online Resources for Students',
    author: 'Admin',
    authorAvatar: 'https://randomuser.me/api/portraits/men/65.jpg',
    date: 'June 28, 2025',
    excerpt: 'A curated list of the best free online resources for students in 2025.',
    content: `Here are some of the best free resources for students:\n\n- Khan Academy\n- Coursera\n- edX\n- FreeCodeCamp\n- OpenStax\n\nExplore these platforms to expand your knowledge!`,
    image: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=600&q=80',
    tags: ['Resources', 'Free', 'Online']
  }
];

function Blog() {
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleShare = (blog) => {
    navigator.clipboard.writeText(window.location.href + `#blog-${blog.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="blog-container">
      <div className="blog-header">
        <span className="blog-header-icon" role="img" aria-label="Blog">📰</span>
        <h1 className="blog-title-gradient">Student Blog</h1>
        <p className="blog-header-intro">Inspiration, tips, and stories for students—written by students and educators. Dive in and discover something new!</p>
      </div>
      <div className="blog-grid animate-blog-cards">
        {demoBlogs.map((blog, idx) => (
          <div className="blog-card" key={blog.id} style={{ animationDelay: `${idx * 0.08 + 0.1}s` }} id={`blog-${blog.id}`}>
            <img src={blog.image} alt={blog.title} className="blog-image" />
            <div className="blog-content">
              <h2>{blog.title}</h2>
              <div className="blog-meta">
                <img src={blog.authorAvatar} alt={blog.author} className="blog-author-avatar" />
                <span>By {blog.author}</span>
                <span>{blog.date}</span>
              </div>
              <div className="blog-tags">
                {blog.tags && blog.tags.map(tag => (
                  <span className="blog-tag" key={tag}>{tag}</span>
                ))}
              </div>
              <p className="blog-excerpt">{blog.excerpt}</p>
              <button className="read-more-btn" onClick={() => setSelected(blog)}>Read More</button>
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <div className="blog-modal-overlay" onClick={() => setSelected(null)}>
          <div className="blog-modal" onClick={e => e.stopPropagation()}>
            <div className="blog-modal-header-gradient">
              <img src={selected.authorAvatar} alt={selected.author} className="blog-modal-avatar" />
              <div>
                <h2>{selected.title}</h2>
                <div className="blog-meta">
                  <span>By {selected.author}</span>
                  <span>{selected.date}</span>
                </div>
              </div>
              <button className="close-modal" onClick={() => setSelected(null)}>×</button>
            </div>
            <img src={selected.image} alt={selected.title} className="blog-modal-image" />
            <div className="blog-tags blog-modal-tags">
              {selected.tags && selected.tags.map(tag => (
                <span className="blog-tag" key={tag}>{tag}</span>
              ))}
            </div>
            <p className="blog-modal-content">{selected.content}</p>
            <button className="share-btn" onClick={() => handleShare(selected)}>{copied ? 'Copied!' : 'Share'}</button>
          </div>
        </div>
      )}
      <div className="blog-cta-section">
        <h3>Want to contribute?</h3>
        <p>Share your story, tips, or student experience with the community.</p>
        <a href="mailto:contact@unicollab.com" className="blog-cta-btn">Write for Us</a>
      </div>
    </div>
  );
}

export default Blog; 