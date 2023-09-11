'use client'
import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import * as BrowserFS from 'browserfs';
import axios from 'axios';
import { signIn, getSession,useSession } from "next-auth/react";
import { SessionProvider } from 'next-auth/react';
import TextWriter from './textwriter';
import { authOptions } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { randomBytes } from 'crypto';
const fs = BrowserFS.BFSRequire('fs');
import { Table } from '@/components/ui/table';
export default function Home() {

  const [formData, setFormData] = useState<FormData | null>(null);
  const [convertedText, setConvertedText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState<'work' | 'personal' | null>(null);
  const [recordingData, setRecordingData] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [status, setStatus] = useState<'success' | 'failure' | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const router = useRouter();
  const { data: session } = useSession(); // Get session data with Google token
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const fetchFiles = async (session: unknown) => {
    const accessToken = session?.accessToken; // Assuming you have the access token in session
    const url = "https://www.googleapis.com/drive/v3/files"; // Update with the correct endpoint
  useEffect(() => {
  if (session) {
    fetchFiles(session).then(setFiles);
  }
}, [session]);
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          q: "name contains 'Trainscription'", // Update the query to suit your needs
        },
      });
      
      return response.data.files || [];
    } catch (error) {
      console.error('Error fetching files:', error);
      return [];
    }
  };
  
    if (!session) {
      
      router.push('/auth');
    }

    let fileId: string | null = null; // Declare a variable to hold the Google Sheet ID at the script level.

    const saveToGoogleDrive = async (text: string) => {
      try {
        const epochTimestamp = new Date().getTime();
        let texts = text.replace(/,/g, '');
    
        const token_type = 'Bearer'; // Update this
        const access_token = session?.accessToken; // Update this
    
        const spreadsheetId = '1wSgN4RpG-o_K6TctlQ_GYTznNJ0V9n5YKh10NctN9T8'; // Update this
        const sheetName = 'Sheet1'; // Update this
    
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}:append`;
        const queryParameters = {
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
        };
        const queryBody = {
          values: [[texts, epochTimestamp]],
        };
    
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `${token_type} ${access_token}`,
        };
    
        const axiosConfig = {
          method: 'POST',
          url,
          headers,
          params: queryParameters,
          data: queryBody,
        };
    
        await axios(axiosConfig);
        console.log(`Row added to Google Sheet`);
      } catch (error) {
        console.error('Error saving to Google Drive:', error);
      }
    };
    

  const handleReset = () => {
    setConvertedText('');
    setLoading(false);
    setRecording(null);
    setRecordingData(null);
    setStatus(null);
    setFiles([]);
    setUploadSuccess(false);
  };
  
  
  
  const handleStartRecording = async (type: 'work' | 'personal') => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
      setRecordingData(audioBlob);
    };

    mediaRecorderRef.current.start();
    setRecording(type);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setRecording(null);
  };
 async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const files = file.toString()
      const filePath = `/audio-${Date.now()}.mp3`;
      fs.writeFileSync(filePath,  new Buffer(files));

      const data = new FormData();
      data.append('file', fs.readFileSync(filePath));
      data.append('model', 'whisper-1');
      data.append('language', 'en');
      setFormData(data);

      if (file.size > 25 * 1024 * 1024) {
        alert('Please upload an audio file less than 25MB');
        return;
      }
    }
  };
  const sendAudio = async () => {
    if (!recordingData) {
      // Handle the error case when recordingData is null
      return;
    }
  
    setLoading(true);
  
    const data = new FormData();
    const filePath = `audio-${Date.now()}.mp3`;
    data.append('file', recordingData, filePath);
    data.append('model', 'whisper-1');
    data.append('language', 'en');
  
    try {
      const res = await axios.post('https://api.openai.com/v1/audio/transcriptions', data, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? ''}`,
        },
      });
  
      setLoading(false);
      setStatus('success');
      setConvertedText(res.data.text);
    } catch (error) {
      setLoading(false);
      setStatus('failure');
    }
    if (status === 'success') {
      // Save the transcribed text to Google Drive
      console.log(saveToGoogleDrive(convertedText));
    }

  };

  useEffect(() => {
    BrowserFS.install(window);

    BrowserFS.configure({
      fs: 'LocalStorage',
      options: undefined
    }, function (err) {
      if (err) throw err;
    });
  }, []); // Only runs once after the initial render

 

  const rows = files.map((file) => [
    file.name,
    file.modifiedTime,
    file.size, // Adjust according to the actual structure of your files
  ]);


  const headers = ['Name', 'Modified Time', 'Size'];



  return (     

    <main className="flex min-h-screen flex-col items-center justify-between p-24 relative">
    {status === 'success' && <div className="absolute top-0 right-0 text-green-500 text-4xl">✓</div>}
    {status === 'failure' && <div className="absolute top-0 right-0 text-red-500 text-4xl">×</div>}
    <div className="flex flex-row">
<div className="flex-col"> <a
            className="group bg-black rounded-lg border border-green px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer"
            style={{color: "white", background: 'green'}}

          ><button onClick={sendAudio} disabled={!recordingData}>
        Send Audio
      </button></a></div>

       
      <div className="flex-row"> <a
            className="group bg-black rounded-lg border border-green px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer" 
            style={{color: "white", background: 'red'}}
          ><button onClick={handleReset} className="text-red hover:text-white ">
    Reset
  </button></a></div> </div>
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
       
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
        <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        
        <a
            className="group bg-black rounded-lg border border-green px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer"
          >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            
          </h2>     

          <button
        onClick={() => recording ? handleStopRecording() : handleStartRecording('personal')}
        className="text-white hover:text-white px-4 py-2"
      >
        {recording === 'personal' ? 'Stop Personal' : 'Personal'}
      </button>
</a> </div>
     

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        
        <a
            className="group bg-black rounded-lg border border-green  px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
           
            </h2>
           
  <button
          onClick={() => recording ? handleStopRecording() : handleStartRecording('work')}
          className="text-white hover:text-white px-4 py-2"
        >
          {recording === 'work' ? 'Stop Work' : 'Work'}
        </button>
  
        </a>      </div>
      </div>   </div>


      
  <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">

     </div>
   
          
          <div>
          
        <TextWriter text={convertedText} delay={10} />
      </div>       

      {uploadSuccess && <div className="text-green-500">Tr<strong>AI</strong>nscription <strong>uploaded</strong> successfully!</div>}

  </main>

  );
}