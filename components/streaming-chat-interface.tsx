"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ScrollArea  from "@/components/ui/scroll-area";
import { Upload, Send, FileText } from "lucide-react";
import axios from "axios";
import { API_URL } from "@/constants";
import MarkdownRenderer from "./ui/MarkdownRenderer";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Question = {
  question: string;
  answer: string;
};

export function StreamingChatInterface() {
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [streamedQuestions, setStreamedQuestions] = useState<Question[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [pdf_text, setPdfText] = useState<string>("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const updatedMessages = [...messages, { role: "user", content: input }];
    setMessages(updatedMessages as Message[]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(API_URL + "/chat-contract/", {
        messages: updatedMessages, // Use the updated messages
        pdf_text: pdf_text,
      });

      simulateStreamingResponse(response.data.message);
    } catch (error) {
      console.error("Error fetching chat completion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      axios
        .post(API_URL + "/generate-questions/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(async (response) => {
          if (response.data.questions && response.data.questions.length > 0) {
            setGeneratedQuestions(response.data.questions);
            setPdfText(response.data.pdf_text);
            setShowQuestions(true);
            await streamQuestions(response.data.questions); // Pass questions here to ensure consistency
          } else {
            console.error("No questions generated");
          }
        })
        .catch((error) => {
          console.error("Error uploading contract:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const streamQuestions = async (questions: Question[]) => {
    setStreamedQuestions([]);
    for (let i = 0; i < questions.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStreamedQuestions((prev) => [...prev, questions[i]]);
    }
  };

  const handleQuestionClick = (question: Question) => {
    setMessages((prev) => [...prev, { role: "user", content: question.question }]);
    simulateStreamingResponse(question.answer);
  };

  const simulateStreamingResponse = async (response: string) => {
    setIsStreaming(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    for (let i = 0; i < response.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20));
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = response.slice(0, i + 1);
        return newMessages;
      });
    }
    setIsStreaming(false);
  };

  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, 0);
  }, [messages]);

  return (
    <div className="flex h-screen bg-[#0f1117] text-gray-100 p-6 space-x-6">
      {!showQuestions && (
        <Card className="w-1/3 bg-[#1a1d27] overflow-hidden border-gray-700 shadow-xl rounded-xl transition-all duration-300 ease-in-out">
          <CardContent className="p-4 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-gray-100">Upload Contract</h2>
            <div className="flex-grow flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-[#2a2e3b] hover:bg-[#353a4b] transition-all duration-300"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400 animate-bounce" />
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </label>
            </div>
            {file && (
              <div className="mt-4 p-4 bg-[#2a2e3b] rounded-lg flex items-center animate-fade-in">
                <FileText className="w-6 h-6 mr-2 text-gray-400" />
                <span className="text-sm truncate text-gray-300">{file.name}</span>
              </div>
            )}
            {isLoading && (
              <div className="mt-4 text-center">
                <div
                  className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                  role="status"
                >
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    Loading...
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      <div className={`flex-1 flex flex-col ${showQuestions ? "w-full" : "w-2/3"}`}>
        <Card className="flex-1 bg-[#1a1d27] mb-6 overflow-hidden border-gray-700 shadow-xl rounded-xl">
          <CardContent className="p-4 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-gray-100">Chat</h2>

              <ScrollArea className="flex-1 pr-4" ref={chatContainerRef}>
                {messages.map((message, index) => (
                  <div key={index} className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}>
                    <div
                      className={`inline-block p-4 rounded-2xl ${
                        message.role === "user"
                          ? "bg-[#4a5568] text-gray-100 rounded-br-none"
                          : "bg-[#2d3748] text-gray-300 rounded-bl-none"
                      } animate-fade-in transition-all duration-300 shadow-md`}
                    >
                      <MarkdownRenderer markdownText={message.content} />

                      {index === messages.length - 1 && message.role === "assistant" && isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-blink"></span>
                      )}
                    </div>
                  </div>
                ))}
              </ScrollArea>

            <div className="flex mt-4">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage(e);
                  }
                }}
                className="flex-1 mr-2 bg-[#2a2e3b] border-gray-600 text-gray-100 focus:ring-2 focus:ring-gray-400 transition-all duration-300"
              />
              <Button
                onClick={handleSendMessage}
                className="bg-[#3a3f4b] hover:bg-[#4a4f5b] transition-all duration-300 rounded-full p-2"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
        {showQuestions && (
          <Card className="bg-[#1a1d27] border-gray-700 shadow-xl rounded-xl">
            <CardContent className="p-4">
              <h2 className="text-2xl font-bold mb-4 text-gray-100">Suggested Questions</h2>
              <ScrollArea className="h-48">
                {streamedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start mb-2 text-left hover:bg-[#2a2e3b] transition-all duration-300 group rounded-lg p-3 animate-fade-in"
                    onClick={() => handleQuestionClick(question)}
                  >
                    <span className="w-6 h-6 flex items-center justify-center bg-[#4a5568] text-white rounded-full mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-gray-300 font-medium">{question.question}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{question.answer}</p>
                    </div>
                  </Button>
                ))}
                {streamedQuestions.length < generatedQuestions.length && (
                  <div className="flex items-center justify-center p-4">
                    <div
                      className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                      role="status"
                    >
                      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                        Loading questions...
                      </span>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
