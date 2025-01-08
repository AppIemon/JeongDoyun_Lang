'use client';

import { useState } from 'react';
import { styles } from '../styles/globals.css';
import { decodeCode } from '../lib/decode';

const ErrorHighlight = ({ code, errorPosition }) => {
  if (!errorPosition) return <span className="text-red-600">{code}</span>;
  
  return (
    <div className="font-mono">
      <span className="text-gray-600">{code.slice(0, errorPosition)}</span>
      <span className="text-red-600 font-bold bg-red-100 px-1">
        {code.slice(errorPosition, errorPosition + 1)}
      </span>
      <span className="text-gray-600">{code.slice(errorPosition + 1)}</span>
    </div>
  );
};

export default function Home() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState([]);
  const [variables, setVariables] = useState([]);

  const handleRun = () => {
    const { result, errors, variables } = decodeCode(code);
    setOutput(result);
    setErrors(errors);
    setVariables(variables);
  };

  return (
    <main className="container">
      <h1 className="text-4xl font-bold text-center mb-8">
        정도윤 프로그래밍 언어 해석기
      </h1>
      <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
        <textarea
          className="w-full p-6 border rounded-xl resize-none"
          placeholder="코드를 입력하세요..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          className="w-full py-3 px-4 text-white rounded-lg transition-colors"
          onClick={handleRun}
        >
          코드 실행
        </button>
        
        {/* 에러 메시지 표시 */}
        {errors.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4">
            <h3 className="text-red-800 font-bold mb-2 text-lg">오류 발생</h3>
            {errors.map((error, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-sm font-medium">
                    {error.type}
                  </span>
                  <span className="text-red-700">{error.message}</span>
                </div>
                <div className="bg-white rounded p-2 font-mono text-sm">
                  <div className="text-gray-500 mb-1">줄 {error.line}:</div>
                  <ErrorHighlight code={error.code} errorPosition={error.errorPosition} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 변수 상태 표시 */}
        {variables.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="text-blue-800 font-semibold mb-2">변수 상태</h3>
            <div className="grid grid-cols-2 gap-2">
              {variables.map((variable, index) => (
                <div key={index} className="text-blue-700">
                  {variable.name}: {variable.value}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 출력 결과 */}
        <div className="flex-1 overflow-hidden">
          <h2 className="text-2xl font-semibold mb-2">출력 결과:</h2>
          <pre className="p-6 text-white rounded-xl whitespace-pre-wrap text-lg">
            {output}
          </pre>
        </div>
      </div>
    </main>
  );
}