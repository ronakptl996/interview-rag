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

export const getNextQuestion = async (fileId: string, previousChats: any) => {
  const data = await qdrantClient.scroll(fileId, {
    with_payload: true,
  });

  if (data.points.length === 0) {
    throw new Error("No data found");
  }

  const context = data.points.map((point) => point.payload?.content).join("\n");

  let systemPrompt;

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
      - Instead of "Tell me about yourself," say: "I'd love to hear a bit about your path into software development — what sparked your interest?"
      - Instead of "What is your educational background?", try: "Can you walk me through your academic journey and what you studied?"
      - Instead of "What are your skills?", ask: "What kinds of problems do you enjoy solving the most in your work?"

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

      Based on the resume and past conversation:
      1. First, identify technologies mentioned in the resume (e.g., JavaScript, React, AWS, Git, etc.)
      2. Then identify any specific projects mentioned in the resume
      3. Assess the candidate's experience level with each technology
      4. Generate a **single, concise technical question** following these rules:

      STRICT QUESTION ORDER:
      1. MUST start with technology-specific questions first
      2. Only after ALL technology questions are asked, then ask project-specific questions
      3. For each technology, follow this order:
         - Start with basic questions
         - Then intermediate questions
         - Then advanced questions
         - Only move to next technology after completing all levels of current technology

      Technology progression by level:
        JavaScript:
          Basic: "What is hoisting in JavaScript?", "What are closures?", "What is the event loop?", "What is the difference between == and ==="
          Intermediate: "How does async/await work?", "What are promises?", "What is the difference between let, const, and var?", "What is the spread operator?"
          Advanced: "How would you implement a debounce function?", "What is the prototype chain?", "How does 'this' work in JavaScript?", "What is the difference between call, apply, and bind?"

        React:
          Basic: "What is React?", "What is JSX?", "What are React Hooks?", "What is state in React?", "What are props?"
          Intermediate: "How do you handle side effects in React?", "What is the difference between useState and useReducer?", "What is the Context API?", "What is the difference between controlled and uncontrolled components?"
          Advanced: "How would you optimize React performance?", "Explain React's virtual DOM", "What are React's design patterns?", "How would you implement code splitting?"

        Node.js:
          Basic: "What is Node.js?", "What is npm?", "What is the package.json file?", "What is the difference between dependencies and devDependencies?"
          Intermediate: "How do you handle errors in Node.js?", "What is middleware?", "How do you manage environment variables?", "What is the difference between process.nextTick and setImmediate?"
          Advanced: "How would you scale a Node.js application?", "What is the event loop in Node.js?", "How do you handle memory leaks?", "What is the difference between cluster and worker threads?"

        [Add more technologies as user mention in the resume]

      Project-specific questions (ONLY after all technology questions are asked):
        - "What was the most challenging part of building [Project Name]?"
        - "How did you handle [specific feature] in [Project Name]?"
        - "What architecture decisions did you make in [Project Name] and why?"
        - "How did you ensure scalability in [Project Name]?"
        - "What testing strategies did you implement in [Project Name]?"
      
      Rules:
        - Ask **only one question at a time**
        - Keep the tone professional but friendly
        - Rephrase to avoid repeating earlier questions
        - NEVER ask project questions before technology questions
        - Check conversation history to avoid repeating questions

      Also you can counter the candidate's answer with a question if the candidate's answer is not detailed enough.
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

export const getAnalysis = async (chats: any[]) => {
  // Build a transcript for the LLM
  try {
    const qaPairs = chats
      .map((c, i) => `Q${i + 1}: ${c.query}\nA${i + 1}: ${c.response || ""}`)
      .join("\n");

    const analysisPrompt = `
      You are an expert technical interviewer and evaluator. Analyze the following interview transcript as a whole, and provide an overall assessment for the candidate on these metrics: Correctness, Clarity, Relevance, Detail, Efficiency, Creativity, Communication.
  
      For each metric, provide:
      - A score from 1 to 10 (10 is best)
      - A brief comment justifying the score
      - Based on a user provided answer you can give them score and add a comment on matrics
  
      Here is the interview transcript:
      ${qaPairs}
  
      Return your analysis as a JSON object in this format:
      {
        "Correctness": { "score": 8, "comment": "..." },
        "Clarity": { "score": 7, "comment": "..." },
        "Relevance": { "score": 6, "comment": "..." },
        "Detail": { "score": 8, "comment": "..." },
        "Efficiency": { "score": 9, "comment": "..." },
        "Creativity": { "score": 7, "comment": "..." },
        "Communication": { "score": 8, "comment": "..." }
      }
    `;

    const response = await genai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: analysisPrompt,
      config: {
        systemInstruction: "You are an expert interview analyst.",
      },
    });

    if (!response.text) {
      throw new Error("No response");
    }

    const match =
      response.text.match(/```json\s*([\s\S]*?)```/i) ||
      response.text.match(/```([\s\S]*?)```/i);

    let jsonString = match ? match[1] : response.text;

    return JSON.parse(jsonString);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const classifyUserAnswer = async (query: string, answer: string) => {
  const response = await genai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: [
      `You are monitoring an interview session.`,
      `The interviewer asked: "${query}"`,
      `The candidate replied: "${answer}"`,
      `Classify the user's reply as one of the following:`,
      `- "answer": if the user is attempting to answer the question`,
      `- "clarification": if the user is asking to repeat, elaborate, simplify, or clarify the question`,
      `Return only the classification label.`,
    ],
  });
  const classification = response.text?.trim();

  if (classification === "clarification") {
    const clarificationPrompt = await genai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Please rephrase and elaborate the following question for better understanding:\n"${query}"`,
      config: {
        systemInstruction:
          "Make the question clearer or more detailed without changing its core meaning.",
      },
    });

    return clarificationPrompt.text!.trim();
  }

  return false;
};
