import { tavily } from '@tavily/core';

const MAX_SEARCH_RESULTS = 2;

interface SearchResult {
  title: string;
  content: string;
  url: string;
}

/**
 * Get difficulty-specific search terms to append to queries
 */
function getDifficultySearchTerms(difficulty: 'beginner' | 'intermediate' | 'advanced'): string {
  const terms = {
    beginner: 'basics fundamentals introduction tutorial beginner guide concepts',
    intermediate: 'practical applications common tools interview questions real-world scenarios',
    advanced: 'expert advanced complex architecture best practices optimization patterns'
  };
  
  return terms[difficulty];
}

/**
 * Get difficulty-specific focus areas for question generation
 */
export function getDifficultyFocus(difficulty: 'beginner' | 'intermediate' | 'advanced'): string {
  const focus = {
    beginner: 'Focus on basic definitions, core concepts, terminology, and fundamental principles. Questions should be straightforward and test foundational knowledge.',
    intermediate: 'Focus on practical applications, common tools and frameworks, real-world scenarios, and how-to knowledge. Questions should test applied understanding.',
    advanced: 'Focus on complex problem-solving, system design, architecture patterns, optimization techniques, edge cases, and expert-level best practices. Questions should be challenging and require deep expertise.'
  };
  
  return focus[difficulty];
}

/**
 * Search for career and difficulty-specific content from the web
 */
export async function searchForCareerContent(
  careerPath: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): Promise<string> {
  try {
    const apiKey = process.env.TAVILY_API_KEY;
    
    if (!apiKey) {
      console.warn('TAVILY_API_KEY not found, skipping web search');
      return '';
    }

    const tvly = tavily({ apiKey });
    
    // Create difficulty-specific search query
    const difficultyTerms = getDifficultySearchTerms(difficulty);
    const currentYear = new Date().getFullYear();
    const searchQuery = `${careerPath} ${difficultyTerms} ${currentYear}`;
    
    console.log(`Searching web for: "${searchQuery}"`);

    // Perform search with timeout
    const searchPromise = tvly.search(searchQuery, {
      maxResults: MAX_SEARCH_RESULTS,
      searchDepth: 'basic',
      includeAnswer: false,
    });
    
    // Add 2 second timeout for search
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Search timeout')), 2000)
    );
    
    const response = await Promise.race([searchPromise, timeoutPromise]) as any;

    if (!response.results || response.results.length === 0) {
      console.warn('No search results found');
      return '';
    }

    // Format search results into context
    const searchContext = response.results
      .map((result: SearchResult, index: number) => {
        return `[Source ${index + 1}]: ${result.title}\n${result.content}`;
      })
      .join('\n\n');

    console.log(`Successfully fetched ${response.results.length} search results`);
    
    return searchContext;
  } catch (error) {
    console.error('Search error:', error);
    // Don't fail the entire request if search fails
    return '';
  }
}

/**
 * Generate a unique seed for question variation
 */
export function generateUniqueSeed(): string {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000000);
  const randomChars = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomNum}-${randomChars}`;
}