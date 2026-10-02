/**
 * Placeholder inference API — swap INFERENCE_ENDPOINT when model is ready.
 */

export interface ImageInferenceResult {
  imageName: string;
  result: string;
}

const INFERENCE_ENDPOINT =
  import.meta.env.VITE_INFERENCE_ENDPOINT || '/api/infer';

/**
 * Sends 1–10 images to the inference endpoint.
 * Currently stubbed: simulates network delay and returns mock results per image.
 * Replace the body of this function with a real fetch to INFERENCE_ENDPOINT when ready.
 */
export async function analyzeImages(files: File[]): Promise<ImageInferenceResult[]> {
  if (files.length === 0) {
    throw new Error('No images provided');
  }
  if (files.length > 10) {
    throw new Error('Maximum 10 images allowed');
  }

  const useRealEndpoint = import.meta.env.VITE_INFERENCE_ENDPOINT;

  if (useRealEndpoint) {
    const formData = new FormData();
    files.forEach((file, i) => formData.append('images', file, file.name || `image-${i}.jpg`));

    const response = await fetch(INFERENCE_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Inference failed (${response.status})`);
    }

    const data = (await response.json()) as ImageInferenceResult[] | { results: ImageInferenceResult[] };
    return Array.isArray(data) ? data : data.results;
  }

  // Stub: simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 800 + files.length * 200));

  return files.map((file) => ({
    imageName: file.name,
    result: mockResultFor(file.name),
  }));
}

function mockResultFor(name: string): string {
  const labels = ['Healthy turf', 'Moderate stress', 'Dry patch detected', 'Disease risk: low'];
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return labels[hash % labels.length];
}
