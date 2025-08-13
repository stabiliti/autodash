
import React from 'react';
import Spinner from './ui/Spinner';

interface LoadingScreenProps {
  message: string;
}

export default function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
      <Spinner />
      <p className="mt-6 text-xl text-slate-300 font-medium loading-text-animate" key={message}>{message}</p>
    </div>
  );
}