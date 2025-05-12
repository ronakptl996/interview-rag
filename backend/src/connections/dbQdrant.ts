import dotenv from "dotenv";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

dotenv.config();

const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
});

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "text-embedding-004",
});

export const uploadPDFToQdrant = async (filePath: string, fileId: string) => {
  try {
    console.log("Uploading PDF to Qdrant");
    console.log("filePath >>>", filePath);
    console.log("fileId >>>", fileId);

    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    console.log("docs >>>", JSON.stringify(docs, null, 2));

    const splitDocs = await textSplitter.splitDocuments(docs);

    const collectionExists = await qdrantClient.collectionExists(fileId);

    if (collectionExists.exists) {
      await qdrantClient.deleteCollection(fileId);
    }

    await QdrantVectorStore.fromDocuments(splitDocs, embeddings, {
      url: process.env.QDRANT_URL,
      collectionName: fileId,
    });

    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const queryToGemini = async (query: string, fileId: string) => {
  try {
    const collectionExists = await qdrantClient.collectionExists(fileId);

    if (!collectionExists.exists) {
      throw new Error("Collection does not exist");
    }

    const vectorStore = new QdrantVectorStore(embeddings, {
      url: process.env.QDRANT_URL,
      collectionName: fileId,
    });

    const searchResults = await vectorStore.similaritySearch(query);
    const context = searchResults
      .map((result) => result.pageContent)
      .join("\n");

    const systemPrompt = `You are a helpful AI assistant. that will answer the user query using the provided context from the pdf file.
		  Context: ${context}
			You can understand the user query and give the answer from the context very professionally.`;

    const response = await genai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: query,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    if (!response.text) {
      throw new Error("No response");
    }

    return response.text;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getNextQuestion = async (fileId: string, previousChats: any) => {
  const data = await qdrantClient.scroll(fileId, {
    with_payload: true,
  });

  if (data.points.length === 0) {
    throw new Error("No data found");
  }

  const context = data.points.map((point) => point.payload?.content).join("\n");

  let systemPrompt;

  console.log("previousChats >>>", previousChats.length);
  // Build Q&A history string for the prompt
  const qaHistoryString = previousChats
    .map(
      (item: any, idx: number) =>
        `Q${idx + 1}: ${item.query}\nA${idx + 1}: ${item.response || ""}`
    )
    .join("\n");

  if (previousChats.length <= 4) {
    systemPrompt = `
      You are a professional interviewer starting a structured personal interview question.

      Your goal is to begin the interview with a warm and conversational tone and ask **strictly personal and career-background questions** for the first 3 to 4 interactions. Do not ask technical questions at this stage — avoid asking about programming languages, tools, or challenges. also do not ask the same question twice.

      Instead, ask about the candidate's:
      - Personal Information
      - Educational background
      - Career journey
      - Career interests
      - Soft skills

      Here are some example rephrasings:
      - Instead of “Tell me about yourself,” say: “I'd love to hear a bit about your path into software development — what sparked your interest?”
      - Instead of “What is your educational background?”, try: “Can you walk me through your academic journey and what you studied?”
      - Instead of “What are your skills?”, ask: “What kinds of problems do you enjoy solving the most in your work?”

      Rules:
      - Ask **only one question at a time**
      - Keep the tone professional but friendly
      - Rephrase to avoid repeating earlier questions
      - Do not mention tools, technologies, or programming languages until later

      Also you can counter the candidate's answer with a question if the candidate's answer is not detailed enough.

      Here is the conversation so far:
      ${qaHistoryString}
    `;
  } else {
    systemPrompt = `
      You are an expert technical interviewer evaluating a candidate for a software development role.

      Here is the candidate's resume:
      ${context}

      Here is the conversation history so far:
      ${qaHistoryString}

      Based on the resume and past conversation, ask a **relevant technical question** related to the candidate’s experience, skills, or projects. Focus on technologies that are mentioned in the resume.
      
      Do not ask the same question twice.
      Ask only **one question at a time**, and maintain a professional tone.
    `;
  }

  // Generate the next question
  const response = await genai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: "Generate the next interview question.",
    config: { systemInstruction: systemPrompt },
  });

  const question = response.text?.trim();

  if (!question) {
    throw new Error("No question generated");
  }

  return question;
};
