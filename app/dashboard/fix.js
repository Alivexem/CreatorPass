'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { faPersonArrowUpFromLine } from '@fortawesome/free-solid-svg-icons/faPersonArrowUpFromLine';


const Nav = dynamic(() => import('../nav'), { ssr: false });
const Bar = dynamic(() => import('../bar'), { ssr: false });
const Pcnav = dynamic(() => import('../pcupnav'), { ssr: false });

const Page = () => {
  const router = useRouter()
  const [note, setNote] = useState('');
  const [image, setimage] = useState('');
  const [loading, setLoading] = useState(false);
  const [myPoster, setPoster] = useState(false)
  const [fullname, setFullname] = useState('');
  const [postText, setPostText] = useState('post')

  const poster = () => {
    setPoster(prev => !prev)
  }
  const typing = (e) => {
    setNote(e.target.value);
  };
 
  const handleFullnameChange = (e) => {
    setFullname(e.target.value); // Update fullname on change
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
  
    reader.readAsDataURL(file); 
    setLoading(true); // Start loading when image upload begins
  
    reader.onloadend = async () => {
      const base64data = reader.result; 
  
      try {
        const res = await fetch(" https://creatorpass.app/imageapi", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: base64data }), 
        });
        const data = await res.json();
        if (res.ok) {
          setimage(data.url);
          setLoading(false); // Stop loading when image upload is successful
        } else {
          alert('Image upload failed');
          setLoading(false); // Stop loading on failure
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        setLoading(false); // Stop loading on error
      }
    };
  
    reader.onerror = (error) => {
      console.error("Error converting file to base64:", error);
      setLoading(false); // Stop loading on error
    };
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note) {
      alert('Type a post before submitting!');
      return;
    } else if (note.length > 300) {
      alert('Thread too long, make it concise! (300 letters maximum)');
      return;
    }else if(fullname.length > 25){
      alert('Use a short and concise name')
      return
    }
    setPostText('Loading...')
    try {
      // Only include serializable data
      const fullData = {
        username: myPoster ? fullname : '',
        note,
        image,
      };
      const res = await fetch(' https://unical-slime.vercel.app/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullData), // Stringify only serializable data
      });
      if (res.ok) {
        router.push('/posts');
      } else {
        alert('Failed to upload post');
        setPostText('post')
      }
    } catch (error) {
      console.error('Error while submitting:', error);
      setPostText('post')
      alert('Failed to upload post, please contact dev')
    }
  };
  
  return (
    <div className='md:w-[45vw] lg:w-[45vw]'>
      

      <div className="flex flex-row justify-evenly items-center">
        <Image src="newslime.png" className="relative block md:hidden z-20 mb-[1%] w-[70vw] mt-5 h-[60px]" alt="slime" />
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
      <h1 className="top-2 hidden md:block mt-[10vh] z-20 mb-8 text-[2rem] ml-10 font-bold text-shadow-md" style={{ color: 'lime' }}>MAKE A POST</h1>

      <div className='ml-8'>
        <h4 className='text-[0.7rem] mt-2 mb-4 ml-1 md:mt-[5vh]' style={{ color: 'gray', fontFamily: 'monospace' }}>{myPoster ? 'You are currently posting with your identity' : 'No one will know who made the post'}</h4>
        <form onSubmit={handleSubmit}>
                <input style={{display: myPoster ? 'block' : 'none'}} onChange={handleFullnameChange} value={fullname} className='relative mb-5 z-20 pointer-events-auto cursor-text w-[80%] p-3 text-[1rem] text-black rounded-md' id='username' name='username' placeholder="Fullname" />
  
          <textarea onChange={typing} value={note} className='h-[20vh] relative z-20 pointer-events-auto cursor-text w-[80%] p-3 text-[1rem] text-black rounded-md' id='note' name='note' placeholder="What's on your mind?"></textarea>
          <input className='mt-4'
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            name='image'
          />
          {loading && <p className='mt-3 ml-2' style={{color:'lime'}}>Processing image please wait...</p>}
          <br />

          <button 
            type='submit' 
            className={`h-auto border-solid border-1 border-white hover:bg-slate-500 w-[130px] p-1 bg-orange-500 opacity-95 text-white text-[1rem] m-5 ml-0 rounded-md ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`} 
            style={{ pointerEvents: loading ? 'none' : 'auto' }}
            disabled={loading}
          >
            {postText}
          </button>
            
        </form>

      </div>
      <div onClick={poster} className='cursor-pointer mt-7 mb-24 ml-7 flex flex-col gap-y-3 items-center justify-center text-[1rem] p-5 font-bold rounded-lg bg-slate-300 text-black w-[200px]'>
      <FontAwesomeIcon className="relative z-20 cursor-pointer" icon={faPersonArrowUpFromLine} />
    
     <p className='text-center'>{myPoster ? 'Click to post anonymously' : 'Click to post with identity'}</p>
      </div>
     
      
      <Pcnav />
      <Nav />
      <div className='md:flex pcu flex-col gap-y-1 items-center fixed top-[28%] right-[20%]'>
        <Image className='h-[150px] w-[200px]' src='pooky.webp' alt='pslime' />
        <h1 className='text-[1.2rem]' style={{ color: 'gray' }}>COME ON! FEEL FREE</h1>
      </div>

      <Image src='pooky.webp' alt='pooky man' className='absolute hidden -z-10 top-[63vh] right-14 h-[150px] w-[150px]' />
    </div>
  )
}

export default Page;