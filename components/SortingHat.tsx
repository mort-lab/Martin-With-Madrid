"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Question, Answer, House } from "../types";
import { questions } from "../public/questions.js";
import { Moon, Sun, RefreshCw } from "lucide-react";

export default function SortingHat() {
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [userName, setUserName] = useState("");
  const [scores, setScores] = useState<Record<House, number>>({
    Gryffindor: 0,
    Hufflepuff: 0,
    Ravenclaw: 0,
    Slytherin: 0,
  });
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>(
    [
      {
        text: "Welcome to Hogwarts! I'm the Sorting Hat. What's your name?",
        isUser: false,
      },
    ]
  );
  const [isDarkMode, setIsDarkMode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentQuestions(questions);
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDarkMode(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAnswer = (answer: Answer) => {
    const newScores = { ...scores };
    Object.entries(answer.scores).forEach(([house, score]) => {
      newScores[house as House] += score;
    });
    setScores(newScores);

    setMessages((prev) => [...prev, { text: answer.title, isUser: true }]);

    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: currentQuestions[currentQuestionIndex + 1].title,
            isUser: false,
          },
        ]);
      }, 1000);
    } else {
      const selectedHouse = Object.entries(newScores).reduce((a, b) =>
        a[1] > b[1] ? a : b
      )[0] as House;
      setSelectedHouse(selectedHouse);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: `Congratulations, ${userName}! You belong to ${selectedHouse}!`,
            isUser: false,
          },
        ]);
      }, 1000);
    }
  };

  const handleNameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userName.trim()) {
      setMessages((prev) => [
        ...prev,
        { text: userName, isUser: true },
        {
          text: `Nice to meet you, ${userName}! Let's find out which house you belong to.`,
          isUser: false,
        },
      ]);
      setCurrentQuestionIndex(0);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { text: currentQuestions[0].title, isUser: false },
        ]);
      }, 1000);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const resetGame = () => {
    setCurrentQuestionIndex(-1);
    setUserName("");
    setScores({
      Gryffindor: 0,
      Hufflepuff: 0,
      Ravenclaw: 0,
      Slytherin: 0,
    });
    setSelectedHouse(null);
    setMessages([
      {
        text: "Welcome back to Hogwarts! I'm the Sorting Hat. What's your name?",
        isUser: false,
      },
    ]);
  };

  return (
    <div
      className={`w-full max-w-md bg-background rounded-lg shadow-xl overflow-hidden transition-colors duration-300 border-2 border-primary ${
        isDarkMode ? "dark" : ""
      }`}
    >
      <div className="flex flex-col h-[600px]">
        <div className="bg-card p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-card-foreground">
            Sorting Hat
          </h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    message.isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {message.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>
        <div className="border-t border-border p-4 bg-card">
          {currentQuestionIndex === -1 ? (
            <form onSubmit={handleNameSubmit} className="flex">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name..."
                className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary bg-input text-foreground placeholder-muted-foreground"
              />
              <button
                type="submit"
                className="p-2 bg-primary text-primary-foreground rounded-r-md hover:bg-primary/90 transition-colors"
              >
                Send
              </button>
            </form>
          ) : currentQuestionIndex < currentQuestions.length &&
            !selectedHouse ? (
            <div className="space-y-2">
              {currentQuestions[currentQuestionIndex].answers.map(
                (answer, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                    onClick={() => handleAnswer(answer)}
                  >
                    {answer.title}
                  </motion.button>
                )
              )}
            </div>
          ) : selectedHouse ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center"
              onClick={resetGame}
            >
              <RefreshCw size={20} className="mr-2" />
              Try Again 😁
            </motion.button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
