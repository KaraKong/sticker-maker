"use client";
import { useState } from "react";
import Head from "next/head";
import Image from "next/image";

import { Prediction } from "replicate";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Home() {

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState(null);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await fetch("/api/predictions", {
      method: "POST",
      body: new FormData(e.currentTarget),
    });

    let prediction = await response.json();
    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }
    setPrediction(prediction);

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch("/api/predictions/" + prediction.id, { cache: 'no-store' });
      prediction = await response.json();
      if (response.status !== 200) {
        setError(prediction.detail);
        return;
      }
      console.log({ prediction })
      setPrediction(prediction);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <div className="flex flex-col z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex bg-white p-10 border-solid border-1 border-gray-200 rounded-3xl">
        <Head>
          <title>sticker-maker</title>
        </Head>

        <p className="mb-4 text-lg text-slate-700">
          sticker-maker
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
          <input
            type="text"
            name="prompt"
            placeholder="Enter a prompt to display an image"
            className="px-4 py-2 w-full border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
          <button
            type="submit"
            className="px-4 py-2 mt-4 w-full bg-slate-900 text-white rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Go!
          </button>
        </form>

        {error && <div className="mt-4 text-red-500">{error}</div>}

        {prediction && (
          <div className="mt-4">
            {prediction.output && (
              <div className="flex flex-col items-center justify-center w-full">
                <Image
                  src={prediction.output[prediction.output.length - 1]}
                  alt="output"
                  width={460}
                  height={460}
                  className="object-cover w-full h-full rounded-md border-gray-300"
                />
              </div>
            )}
            <p className="mt-4 text-lg text-slate-700">status: {prediction.status}</p>
          </div>
        )}
      </div>
    </main>
  )
}
