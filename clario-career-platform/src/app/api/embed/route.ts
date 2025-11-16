/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

export async function POST() {
  try {
    const PDF_PATH = "./public/CarrerUSAdataset.pdf";

    const pdfLoader = new PDFLoader(PDF_PATH);
    const rawDocs = await pdfLoader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });
    const chunkedDocs = await textSplitter.splitDocuments(rawDocs);


    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: "text-embedding-004",
    });


    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_KEY!,
    });
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);


    await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
      pineconeIndex,
      maxConcurrency: 5,
    });

    return NextResponse.json({ success: true, message: "Vectors stored successfully!" });
  } catch (error: any) {
    console.error("Embedding error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
