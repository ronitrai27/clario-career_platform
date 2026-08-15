import { NextRequest, NextResponse } from 'next/server';
import { getQuestionPipeline } from '@/lib/functions/MockTest/QuestionPipeline';
import { DifficultyLevel } from '@/lib/functions/MockTest/QuizStore';


export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { careerPath, difficulty, count = 10, timestamp, random, sessionId, forceNew } = body;

    // Validate input
    if (!careerPath || typeof careerPath !== 'string') {
      return NextResponse.json(
        { error: 'Career path is required' },
        { status: 400 }
      );
    }

    if (!difficulty || !['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Valid difficulty level is required' },
        { status: 400 }
      );
    }

    // Get pipeline instance
    const pipeline = getQuestionPipeline();

    // Generate questions with error handling
    try {
      const questions = await pipeline.generateQuestions(
        careerPath,
        difficulty as DifficultyLevel,
        count,
        sessionId
      );

      return NextResponse.json({
        success: true,
        questions,
        count: questions.length,
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
        },
      });
    } catch (generationError) {
      console.error('Question generation failed, using fallback:', generationError);
      
      // Return fallback questions with career context
      const fallbackQuestions = pipeline.getFallbackQuestions(
        difficulty as DifficultyLevel,
        careerPath
      );
      
      return NextResponse.json({
        success: true,
        questions: fallbackQuestions,
        count: fallbackQuestions.length,
        warning: 'Using fallback questions due to generation error',
      });
    }
  } catch (error) {
    console.error('API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate questions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}