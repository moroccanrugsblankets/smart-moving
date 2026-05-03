'use client';

import BlogForm from '../BlogForm';

export default function NewBlogPostPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">New Blog Post</h1>
      <BlogForm />
    </div>
  );
}
