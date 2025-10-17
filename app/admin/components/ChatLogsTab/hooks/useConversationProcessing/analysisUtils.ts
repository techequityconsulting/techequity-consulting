// src/app/admin/components/ChatLogsTab/hooks/useConversationProcessing/analysisUtils.ts
// Deep conversation analysis utilities
// Provides engagement scoring, intent detection, sentiment analysis, and more

import { ChatLog } from '../../../../types';
import { ConversationBox } from '../../types';
import { 
  ProcessingConfig, 
  DeepAnalysisResult,
  IntentKeywords,
  SentimentKeywords,
  ResolutionKeywords
} from './types';

/**
 * Perform deep analysis on a conversation
 * Only runs when enableDeepMessageAnalysis is true (tablet/desktop)
 */
export const performDeepAnalysis = (
  conversation: ConversationBox,
  config: ProcessingConfig
): DeepAnalysisResult => {
  if (!config.enableDeepMessageAnalysis) {
    return {
      averageResponseTime: 0,
      conversationDepth: 0,
      userEngagementLevel: 'low',
      detectedIntent: 'unknown',
      hasResolution: false,
      sentimentIndicator: 'neutral'
    };
  }
  
  const messages = conversation.messages;
  const userMessages = messages.filter(msg => msg.messageType === 'user');
  const aiMessages = messages.filter(msg => msg.messageType === 'ai');
  
  return {
    averageResponseTime: calculateAverageResponseTime(messages),
    conversationDepth: Math.min(messages.length, 10), // Cap at 10 for performance
    userEngagementLevel: calculateEngagementLevel(userMessages),
    detectedIntent: detectUserIntent(userMessages),
    hasResolution: detectResolution(messages),
    sentimentIndicator: analyzeSentiment(userMessages)
  };
};

/**
 * Calculate average response time between messages in seconds
 */
export const calculateAverageResponseTime = (messages: ChatLog[]): number => {
  if (messages.length < 2) return 0;
  
  let totalResponseTime = 0;
  let responseCount = 0;
  
  for (let i = 1; i < messages.length; i++) {
    const currentTime = new Date(messages[i].timestamp).getTime();
    const previousTime = new Date(messages[i - 1].timestamp).getTime();
    const responseTime = currentTime - previousTime;
    
    // Only count reasonable response times (under 30 minutes)
    if (responseTime < 1800000) {
      totalResponseTime += responseTime;
      responseCount++;
    }
  }
  
  return responseCount > 0 ? Math.round(totalResponseTime / responseCount / 1000) : 0;
};

/**
 * Calculate user engagement level based on message count and length
 */
export const calculateEngagementLevel = (userMessages: ChatLog[]): 'low' | 'medium' | 'high' => {
  if (userMessages.length === 0) return 'low';
  
  const averageLength = userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / userMessages.length;
  const messageCount = userMessages.length;
  
  // High engagement: 8+ messages with 30+ char average
  if (messageCount >= 8 && averageLength >= 30) return 'high';
  
  // Medium engagement: 4+ messages with 15+ char average
  if (messageCount >= 4 && averageLength >= 15) return 'medium';
  
  // Low engagement: everything else
  return 'low';
};

/**
 * Detect primary user intent from conversation
 */
export const detectUserIntent = (userMessages: ChatLog[]): string => {
  if (userMessages.length === 0) return 'unknown';
  
  const allContent = userMessages.map(msg => msg.content.toLowerCase()).join(' ');
  
  // Intent keywords mapping
  const intents: IntentKeywords = {
    'pricing': ['price', 'cost', 'pricing', 'fee', 'charge', 'expensive', 'affordable', 'payment', 'subscription'],
    'features': ['feature', 'capability', 'function', 'what can', 'how does', 'able to', 'functionality'],
    'support': ['help', 'support', 'problem', 'issue', 'bug', 'error', 'not working', 'broken'],
    'integration': ['integrate', 'api', 'connect', 'plugin', 'compatibility', 'works with', 'compatible'],
    'consultation': ['consultation', 'demo', 'meeting', 'call', 'discuss', 'talk', 'schedule', 'appointment']
  };
  
  // Count matches for each intent
  const intentScores: Record<string, number> = {};
  
  for (const [intent, keywords] of Object.entries(intents)) {
    intentScores[intent] = keywords.filter(keyword => allContent.includes(keyword)).length;
  }
  
  // Find intent with highest score
  let maxScore = 0;
  let detectedIntent = 'general';
  
  for (const [intent, score] of Object.entries(intentScores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedIntent = intent;
    }
  }
  
  return detectedIntent;
};

/**
 * Detect if conversation reached a resolution
 */
export const detectResolution = (messages: ChatLog[]): boolean => {
  if (messages.length < 3) return false;
  
  const lastMessages = messages.slice(-3).map(msg => msg.content.toLowerCase());
  const resolutionKeywords: ResolutionKeywords = [
    'thank', 'thanks', 'perfect', 'great', 'excellent', 'solved', 
    'understood', 'clear', 'got it', 'makes sense', 'appreciate'
  ];
  
  return lastMessages.some(content => 
    resolutionKeywords.some(keyword => content.includes(keyword))
  );
};

/**
 * Analyze sentiment of user messages
 */
export const analyzeSentiment = (userMessages: ChatLog[]): 'positive' | 'neutral' | 'negative' => {
  if (userMessages.length === 0) return 'neutral';
  
  const allContent = userMessages.map(msg => msg.content.toLowerCase()).join(' ');
  
  const sentimentKeywords: SentimentKeywords = {
    positive: [
      'great', 'excellent', 'perfect', 'love', 'amazing', 'wonderful', 
      'fantastic', 'awesome', 'good', 'nice', 'helpful', 'thank', 'thanks'
    ],
    negative: [
      'bad', 'terrible', 'awful', 'hate', 'horrible', 'disappointed', 
      'frustrated', 'angry', 'poor', 'worst', 'useless', 'confused'
    ]
  };
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  sentimentKeywords.positive.forEach(word => {
    if (allContent.includes(word)) positiveCount++;
  });
  
  sentimentKeywords.negative.forEach(word => {
    if (allContent.includes(word)) negativeCount++;
  });
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
};

/**
 * Analyze conversation flow
 * Detects patterns like back-and-forth exchanges
 */
export const analyzeConversationFlow = (messages: ChatLog[]): {
  hasBackAndForth: boolean;
  consecutiveUserMessages: number;
  consecutiveAiMessages: number;
} => {
  if (messages.length === 0) {
    return {
      hasBackAndForth: false,
      consecutiveUserMessages: 0,
      consecutiveAiMessages: 0
    };
  }
  
  let hasBackAndForth = false;
  let maxConsecutiveUser = 0;
  let maxConsecutiveAi = 0;
  let currentConsecutiveUser = 0;
  let currentConsecutiveAi = 0;
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const prevMsg = i > 0 ? messages[i - 1] : null;
    
    if (msg.messageType === 'user') {
      currentConsecutiveUser++;
      currentConsecutiveAi = 0;
      maxConsecutiveUser = Math.max(maxConsecutiveUser, currentConsecutiveUser);
    } else {
      currentConsecutiveAi++;
      currentConsecutiveUser = 0;
      maxConsecutiveAi = Math.max(maxConsecutiveAi, currentConsecutiveAi);
    }
    
    // Check for back-and-forth
    if (prevMsg && prevMsg.messageType !== msg.messageType) {
      hasBackAndForth = true;
    }
  }
  
  return {
    hasBackAndForth,
    consecutiveUserMessages: maxConsecutiveUser,
    consecutiveAiMessages: maxConsecutiveAi
  };
};

/**
 * Calculate conversation complexity score
 * Based on vocabulary, message length, and technical terms
 */
export const calculateComplexityScore = (messages: ChatLog[]): number => {
  if (messages.length === 0) return 0;
  
  const allContent = messages.map(msg => msg.content).join(' ');
  const words = allContent.split(/\s+/);
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  
  // Vocabulary diversity
  const vocabularyScore = (uniqueWords.size / words.length) * 50;
  
  // Average message length
  const avgLength = allContent.length / messages.length;
  const lengthScore = Math.min((avgLength / 100) * 30, 30);
  
  // Technical terms
  const technicalTerms = [
    'api', 'integration', 'database', 'authentication', 'server',
    'configuration', 'deployment', 'architecture', 'infrastructure'
  ];
  const technicalScore = technicalTerms.filter(term => 
    allContent.toLowerCase().includes(term)
  ).length * 5;
  
  return Math.min(vocabularyScore + lengthScore + technicalScore, 100);
};

/**
 * Detect conversation topics
 * Returns array of detected topics
 */
export const detectConversationTopics = (messages: ChatLog[]): string[] => {
  const topics: string[] = [];
  const allContent = messages.map(msg => msg.content.toLowerCase()).join(' ');
  
  const topicKeywords: Record<string, string[]> = {
    'pricing': ['price', 'cost', 'payment', 'subscription', 'plan'],
    'technical': ['api', 'code', 'integration', 'setup', 'configuration'],
    'features': ['feature', 'functionality', 'capability', 'option'],
    'support': ['help', 'issue', 'problem', 'error', 'bug'],
    'onboarding': ['getting started', 'setup', 'guide', 'tutorial', 'documentation'],
    'comparison': ['versus', 'vs', 'compare', 'alternative', 'competitor'],
    'security': ['security', 'privacy', 'encryption', 'safe', 'secure'],
    'performance': ['speed', 'fast', 'slow', 'performance', 'optimization']
  };
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => allContent.includes(keyword))) {
      topics.push(topic);
    }
  }
  
  return topics;
};

/**
 * Calculate response quality score
 * Based on AI message length, helpfulness indicators
 */
export const calculateResponseQuality = (messages: ChatLog[]): number => {
  const aiMessages = messages.filter(msg => msg.messageType === 'ai');
  
  if (aiMessages.length === 0) return 0;
  
  let score = 0;
  
  // Average AI message length
  const avgLength = aiMessages.reduce((sum, msg) => sum + msg.content.length, 0) / aiMessages.length;
  if (avgLength > 100) score += 30;
  else if (avgLength > 50) score += 20;
  else score += 10;
  
  // Contains helpful phrases
  const helpfulPhrases = [
    'let me help', 'i can assist', 'here\'s how', 'you can',
    'would you like', 'i recommend', 'the best way'
  ];
  
  const hasHelpfulPhrases = aiMessages.some(msg => 
    helpfulPhrases.some(phrase => msg.content.toLowerCase().includes(phrase))
  );
  
  if (hasHelpfulPhrases) score += 30;
  
  // Contains examples or code
  const hasExamples = aiMessages.some(msg => 
    msg.content.includes('example') || 
    msg.content.includes('for instance') ||
    msg.content.includes('```')
  );
  
  if (hasExamples) score += 20;
  
  // Multiple responses
  if (aiMessages.length >= 3) score += 20;
  
  return Math.min(score, 100);
};

/**
 * Detect if conversation needs follow-up
 */
export const needsFollowUp = (conversation: ConversationBox): boolean => {
  const messages = conversation.messages;
  
  if (messages.length === 0) return false;
  
  const lastMessage = messages[messages.length - 1];
  const lastContent = lastMessage.content.toLowerCase();
  
  // User's last message contains questions
  if (lastMessage.messageType === 'user' && lastContent.includes('?')) {
    return true;
  }
  
  // Conversation ended abruptly (less than 3 messages)
  if (messages.length < 3) {
    return true;
  }
  
  // No resolution detected and no appointment
  if (!conversation.hasAppointment) {
    const hasResolution = detectResolution(messages);
    if (!hasResolution) {
      return true;
    }
  }
  
  return false;
};

/**
 * Calculate customer satisfaction indicator
 * Returns score from 0-100
 */
export const calculateSatisfactionScore = (conversation: ConversationBox): number => {
  let score = 50; // Start neutral
  
  const sentiment = analyzeSentiment(conversation.messages.filter(msg => msg.messageType === 'user'));
  
  if (sentiment === 'positive') score += 30;
  else if (sentiment === 'negative') score -= 30;
  
  const hasResolution = detectResolution(conversation.messages);
  if (hasResolution) score += 20;
  
  if (conversation.hasAppointment) score += 20;
  
  const engagement = calculateEngagementLevel(conversation.messages.filter(msg => msg.messageType === 'user'));
  if (engagement === 'high') score += 10;
  else if (engagement === 'low') score -= 10;
  
  return Math.max(0, Math.min(100, score));
};