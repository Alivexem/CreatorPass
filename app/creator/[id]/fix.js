'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faMask, faDroplet, faComment } from '@fortawesome/free-solid-svg-icons';
import Interaction from '../interact';

import Nav from '../nav'
import Pcnav from '../pcnav'
import Bar from '../bar'

const generateRandomFreebie = () => {
  const randomNums = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10));
  return `Freebie${randomNums.join('')}`;
};

const Page = () => {
  const [posts, setPosts] = useState([]);
  const [commentInput, setCommentInput] = useState({});
  const [loading, setLoading] = useState(false);

  const [clicked, setClicked] = useState(true);
  const [value, setValue] = useState(1);

  // State for comment visibility
  const [commentVisibility, setCommentVisibility] = useState({});

  const change = () => {
    setClicked(prev => !prev);
  };

  // Function to toggle comment visibility
  const toggleCommentVisibility = (postId) => {
    setCommentVisibility((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Inside the Page component in your frontend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const fetchedPosts = await fetchAllPosts();
      setPosts(fetchedPosts.reverse()); // Reverse the posts array
      setLoading(false);
    };

    const fetchCommentsForPost = async (postId) => {
      try {
        const response = await fetch(` https://unical-slime.vercel.app/comments?postId=${postId}`);
        if (response.ok) {
          const data = await response.json();
          return data;
        } else {
          throw new Error('Failed to fetch comments');
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
      }
    };

    const fetchAllPosts = async () => {
      try {
        const response = await fetch(' https://unical-slime.vercel.app/api', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const posts = await response.json();

        // Fetch comments for each post
        const postsWithComments = await Promise.all(
          posts.anonymous.map(async (post) => {
            const comments = await fetchCommentsForPost(post._id);

            // Count comments
            const commentCount = comments.length;

            return {
              ...post,
              comments, // Array of comments
              commentCount, // Add the comment count here
            };
          })
        );

        return postsWithComments;
      } catch (error) {
        alert("Couldn't fetch posts please reload page.")
        console.error('Error fetching posts:', error);
        return [];
      }
    };

    fetchData();
  }, []);

  const convertLinks = (text) => {
    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    
    return text.split(urlPattern).map((part, index) => {
      if (part.match(urlPattern)) {
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer" style={{ color: 'lime', textDecoration: 'underline' }}>
            {part}
          </a>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };
  
  



  const handleCommentChange = (postId, value) => {
    setCommentInput((prevInputs) => ({
      ...prevInputs,
      [postId]: value,
    }));
  };

  const handleCommentSubmit = async (postId) => {
    const comment = commentInput[postId];
    if (!comment){
        return;
      }else if(comment.length > 200){
        alert('Comment characters exceeded. ( Maximum 200 characters)')
        return
      }
  
    try {
      const response = await fetch(' https://unical-slime.vercel.app/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, comment }),
      });
  
      if (response.ok) {
        const newComment = await response.json();
  
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  comments: [...post.comments, newComment],
                  commentCount: post.commentCount + 1, // Increment the comment count
                }
              : post
          )
        );
  
        setCommentInput((prevInputs) => ({ ...prevInputs, [postId]: '' }));
      } else {
        alert('Failed to submit comment, please try again')
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };
  

  return (
    <div className='md:w-[40vw] md:ml-10'>
      <div className="flex flex-row justify-evenly items-center">
        <Image src="newslime.png" className="relative block md:hidden z-20 w-[70vw] mt-5 h-[60px]" alt="slime" />
        <Bar />
      </div>

      <div
        id="toggleDiv"
        style={{ fontFamily: 'sans-serif' }}
        className="p-4 mt-4 bg-gray-300 text-black hidden-div max-h-0 overflow-hidden transition-all duration-500 ease-in-out"
      >
        <Link href="mailto:slimeunc@gmail.com?subject=Suggestion">
          <p className="cursor-pointer">Suggestion</p>
        </Link>
        <Link href="mailto:slimeunc@gmail.com?subject=Report%20an%20issue">
          <p className="cursor-pointer">Report an issue</p>
        </Link>
        <Link href="/community">
          <p className="cursor-pointer">Community standards and policy</p>
        </Link>
        <Link href="mailto:slimeunc@gmail.com?subject=Found%20a%20bug">
          <p className="cursor-pointer">Found a bug?</p>
        </Link>
      </div>

      <div className='md:flex pcu flex-col gap-y-1 items-center fixed top-[28%] right-[20%]'>
        <Image className='h-[150px] w-[200px]' src='pcslime.webp' alt='pslime' />
        <Image src="newslime.png" className="w-[200px] mt-1 h-[50px]" alt="slime" />
      </div>

      <div id='you' className='relative mt-3 ml-4 mb-2 md:relative text-slate-100 flex flex-row items-center'>
        <p style={{ color: 'black', padding: '4px', fontFamily: 'revert', borderRadius: '7px' }} className='bg-green-600 opacity-95'>YOU ARE NOW ANONYMOUS!</p>
      </div>

      <div className='bg-opacity-85 rounded-md bg-slate-900 mx-1 p-5 w-auto mt-[8%] shadow-t shadow-b shadow-md shadow-green-300'>
        <div className='flex flex-row items-center'>
          <Image className='h-10 w-10 mr-2 rounded-[50%]' src='bb.jpg' alt='anonymous-image' />
          <h3 className='font-bold' style={{ fontFamily: 'monospace' }}>SLIME DEV</h3>
          <Image className='h-5 w-5 ml-1' src='green.avif' alt='anonymous-image' />
        </div>
        <div className='mt-3'>
          <div className='md:flex items-center gap-x-3'>
            <p className='w-[100%] md:w-[65%]'><span className='text-red-600 text-[0.9rem] font-bold'>UPDATE NOTICE:</span> Posts get deleted after 3 days. Please Ensure you read and follow this platform community standards and policy to ensure a healthy social space. Platform lacks users for now, I have not promoted it cause I am working on other projects.</p>
          </div>
        </div>
      </div>

      {posts.length > 0 ? (
        posts.map((post) => (
          <div className='bg-opacity-85 rounded-md bg-slate-900 mx-1 -z-15 p-5 w-auto mt-[8%] shadow-md shadow-green-300' key={post._id}>
            <div className='flex flex-row items-center'>
              <Image className='h-10 w-10 mr-2 rounded-[50%]' src='addy.jpg' alt='anonymous-image' />
              <h3 className='font-bold' style={{ fontFamily: 'monospace' }}>
                {post.username && post.username.trim() !== '' ? post.username : generateRandomFreebie()}
              </h3>
            </div>
            <div className='mt-3'>
              <div className='md:flex items-center gap-x-3'>
                <p className='w-[100%] md:w-[65%]' style={{ whiteSpace: 'pre-wrap' }}> {convertLinks(post.note)}</p>
                {post.image && (
                  <Image
                    className='myImages h-[200px] w-full border-solid border-white border-[1px] rounded-md mt-4 object-fit:contain'
                    src={post.image}
                    alt='anonymous-image'
                    aspect-ratio="1.5"
                  />
                )}
              </div>
              <div className='flex items-center gap-x-7 mt-3 mb-3'>

                {/* <div className='flex gap-x-2 items-center'>
                  <FontAwesomeIcon onClick={change} style={{ color: clicked ? 'gray' : 'lime' }} className="relative z-20 cursor-pointer" icon={faDroplet} />
                </div> */}

                <div onClick={() => toggleCommentVisibility(post._id)}  className='flex ml-2 gap-x-2 mt-2 items-center'>
                  <FontAwesomeIcon 
                    icon={faComment}    
                    className="relative z-20 cursor-pointer text-[1.2rem] active:text-slate-500" 
                  />
                  <p className='pointer-events-none text-[0.8rem]'>{post.commentCount || 0}</p> {/* Display the actual comment count */}
                </div>

              </div>
              <small className='text-slate-300'>{new Date(post.createdAt).toLocaleString()}</small>
            </div>

            {/* Comments Section */}
            {commentVisibility[post._id] && (
              <div className='bg-slate-900 opacity-90 pt-4 h-auto p-3 w-[100%] mt-[7px]'>
                {post.comments.length > 0 ? (
                  post.comments.map((comment, idx) => (
                    <div key={idx} className="mb-4 p-3 rounded-lg bg-slate-700 w-[100%]">
                      <p className='text-[0.9rem] text-slate-50' style={{ wordWrap: 'break-word', overflowWrap: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal' }}>{comment.comment}</p>
                      <small className='text-slate-300'>{new Date(comment.createdAt).toLocaleString()}</small>
                    </div>
                  ))
                ) : (
                  <p>No comments yet!</p>
                )}

                {/* Comment input and submit */}
                <div className='flex items-center mt-5 mb-3 gap-x-3'>
                  <input
                    type="text"
                    placeholder="Write a comment"
                    value={commentInput[post._id] || ''}
                    onChange={(e) => handleCommentChange(post._id, e.target.value)}
                    className='p-1 text-black text-[0.9rem] w-[80%]'
                  />
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    className="cursor-pointer text-[1.2rem] active:text-slate-600"
                    onClick={() => handleCommentSubmit(post._id)}
                  />
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className='bg-opacity-85 rounded-md bg-slate-800 p-5 w-auto mt-[8%] shadow-t shadow-b shadow-md shadow-green-300'>
          <div className='flex flex-row items-center'>
            <Image className='h-10 w-10 mr-2 rounded-[50%]' src='alp.webp' alt='anonymous-image' />
            <h3 className='font-bold' style={{ fontFamily: 'monospace' }}>SLIMES FETCHER</h3>
          </div>
          <div className='mt-3'>
            <p className='w-[250px]'>GETTING NEW SLIMES...</p>
            <small className='text-slate-300'>00-00-0000 0:00am</small>
          </div>
        </div>
      )}

      <div className='mt-8 flex flex-col justify-center items-center'>
        <Image className='h-[100px] w-[100px] mb-1' src='pooky.webp' alt='pooky man' />
        <p className='text-center text-[0.7rem] mb-24 font-bold' style={{ color: 'gray', fontFamily: 'monospace' }}>Slime pooky here, make a post</p>
      </div>
      <Pcnav />
      <Nav />
      
    </div>
  );
};

export default Page;