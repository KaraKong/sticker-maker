import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {

  const data = await req.formData();
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      "The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it."
    );
  }

  const prediction = await replicate.predictions.create({
    version: "58a7099052ed9928ee6a65559caa790bfa8909841261ef588686660189eb9dc8",

    // This is the text prompt that will be submitted by a form on the frontend
    input: { 
      steps: 20,
      width: 1024,
      height: 1024,
      upscale: true,
      upscale_steps: 10,
      negative_prompt: "",
      prompt: data.get("prompt")
    },
  });

  if (prediction?.error) {
    return new Response(
      JSON.stringify({ detail: prediction.error.detail }),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify(prediction),
    { status: 201 }
  );
}