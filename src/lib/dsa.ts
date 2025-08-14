export type Question = {
  id: string;
  title: string;
  description: string;
  category: string;
};

export type Category = {
  name: string;
  questions: Question[];
};

const dsaQuestions: Category[] = [
  {
    name: 'Arrays & Hashing',
    questions: [
      { id: 'arrays-1', title: 'Contains Duplicate', description: 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.', category: 'Arrays & Hashing' },
      { id: 'arrays-2', title: 'Valid Anagram', description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.', category: 'Arrays & Hashing' },
      { id: 'arrays-3', title: 'Two Sum', description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', category: 'Arrays & Hashing' },
    ],
  },
  {
    name: 'Two Pointers',
    questions: [
      { id: 'two-pointers-1', title: 'Valid Palindrome', description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.', category: 'Two Pointers' },
      { id: 'two-pointers-2', title: '3Sum', description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.', category: 'Two Pointers' },
      { id: 'two-pointers-3', title: 'Container With Most Water', description: 'You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.', category: 'Two Pointers' },
    ],
  },
  {
    name: 'Sliding Window',
    questions: [
        { id: 'sliding-window-1', title: 'Best Time to Buy and Sell Stock', description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.', category: 'Sliding Window' },
        { id: 'sliding-window-2', title: 'Longest Substring Without Repeating Characters', description: 'Given a string s, find the length of the longest substring without repeating characters.', category: 'Sliding Window' },
        { id: 'sliding-window-3', title: 'Minimum Window Substring', description: 'Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.', category: 'Sliding Window' },
    ]
  },
  {
      name: 'Stack',
      questions: [
          { id: 'stack-1', title: 'Valid Parentheses', description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.', category: 'Stack' },
          { id: 'stack-2', title: 'Min Stack', description: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.', category: 'Stack' },
          { id: 'stack-3', title: 'Daily Temperatures', description: 'Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature.', category: 'Stack' },
      ]
  }
];

export const allQuestions: Question[] = dsaQuestions.flatMap(category => category.questions);

export const getQuestionById = (id: string): Question | undefined => allQuestions.find(q => q.id === id);

export default dsaQuestions;
