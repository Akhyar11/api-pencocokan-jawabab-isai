import '@tensorflow/tfjs-node';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { ChromaClient } from 'chromadb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let model = null;
let riwayatCollection = null;
const chromaClient = new ChromaClient();

export const initAI = async () => {
  try {
    console.log('Loading TensorFlow Universal Sentence Encoder model (100% Offline)...');
    
    const baseUrl = 'http://localhost:' + (process.env.PORT || 3000) + '/local_model';
    
    model = await use.load({
      modelUrl: baseUrl + '/model.json',
      vocabUrl: baseUrl + '/vocab.json'
    });
    console.log('AI Model loaded successfully from local storage!');

    const tfjsEmbeddingFunction = {
      generate: async (texts) => {
        const embeddings = await model.embed(texts);
        return embeddings.arraySync();
      }
    };

    try {
      riwayatCollection = await chromaClient.getOrCreateCollection({ 
        name: 'riwayat_jawaban',
        embeddingFunction: tfjsEmbeddingFunction
      });
      console.log('ChromaDB collection initialized (Server is running).');
    } catch (chromaError) {
      console.log('Perhatian: Server ChromaDB tidak ditemukan atau error. Penyimpanan vektor akan dilewati.');
      riwayatCollection = null;
    }
  } catch (error) {
    console.error('Error initializing AI:', error);
  }
};

export const evaluasiJawaban = async (jawaban_benar, jawaban_user) => {
  if (!model) {
    throw new Error('Model AI belum siap.');
  }

  // Generate embeddings for both sentences
  const embeddings = await model.embed([jawaban_benar, jawaban_user]);
  const array = embeddings.arraySync();
  
  const A = array[0];
  const B = array[1];

  // Hitung Cosine Similarity secara manual
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < A.length; i++) {
    dotProduct += A[i] * B[i];
    normA += A[i] * A[i];
    normB += B[i] * B[i];
  }
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));

  return similarity;
};

export const simpanKeChroma = async (id, jawaban_benar, jawaban_user, similarity) => {
  try {
    if (!riwayatCollection) {
      console.warn('Chroma collection belum siap.');
      return;
    }
    
    // Generate embedding just for the user's answer
    const embeddings = await model.embed([jawaban_user]);
    const array = embeddings.arraySync();
    
    await riwayatCollection.add({
      ids: [id.toString()],
      embeddings: [array[0]],
      metadatas: [{ jawaban_benar, similarity }],
      documents: [jawaban_user]
    });
  } catch (error) {
    console.error('Gagal menyimpan ke ChromaDB:', error);
  }
};
