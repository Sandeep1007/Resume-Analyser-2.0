import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle } from 'lucide-react';

function App() {
  const [resume, setResume] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [test, setTest] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<{ score: number; category: string } | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleApiCall = async (url: string, data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(url, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(`Error: ${error.response.data.error || 'An unexpected error occurred'}`);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeUpload = async () => {
    const data = await handleApiCall('http://localhost:5000/scan_resume', { resume });
    if (data) {
      setSkills(data.skills);
      setStep(1);
    }
  };

  const handleGenerateTest = async () => {
    const data = await handleApiCall('http://localhost:5000/generate_test', { skills });
    if (data) {
      setTest(data.test);
      setAnswers(new Array(data.test.length).fill(''));
      setStep(2);
    }
  };

  const handleSubmitTest = async () => {
    const data = await handleApiCall('http://localhost:5000/evaluate_test', { answers });
    if (data) {
      setResult(data);
      setStep(3);
    }
  };

  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">AI Resume Chatbot</h1>
        {error && <ErrorMessage message={error} />}
        {isLoading && (
          <div className="text-center mb-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        {step === 0 && (
          <div>
            <textarea
              className="w-full p-2 border rounded mb-4"
              rows={10}
              placeholder="Paste your resume here..."
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />
            <button
              className="w-full bg-blue-500 text-white p-2 rounded flex items-center justify-center"
              onClick={handleResumeUpload}
              disabled={isLoading}
            >
              <Upload className="mr-2" /> Upload Resume
            </button>
          </div>
        )}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Detected Skills:</h2>
            {skills.length > 0 ? (
              <ul className="list-disc pl-5 mb-4">
                {skills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            ) : (
              <p className="mb-4">No skills detected. Please try uploading your resume again.</p>
            )}
            <button
              className="w-full bg-green-500 text-white p-2 rounded flex items-center justify-center"
              onClick={handleGenerateTest}
              disabled={skills.length === 0 || isLoading}
            >
              <FileText className="mr-2" /> Generate Skill Test
            </button>
          </div>
        )}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Skill Test:</h2>
            {test.map((question, index) => (
              <div key={index} className="mb-4">
                <p className="font-medium">{question}</p>
                <textarea
                  className="w-full p-2 border rounded mt-2"
                  rows={3}
                  value={answers[index]}
                  onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[index] = e.target.value;
                    setAnswers(newAnswers);
                  }}
                />
              </div>
            ))}
            <button
              className="w-full bg-purple-500 text-white p-2 rounded flex items-center justify-center"
              onClick={handleSubmitTest}
              disabled={isLoading}
            >
              <CheckCircle className="mr-2" /> Submit Test
            </button>
          </div>
        )}
        {step === 3 && result && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
            <p className="text-lg">Score: {result.score}%</p>
            <p className="text-lg">Category: {result.category}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;