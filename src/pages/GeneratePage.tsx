import { useRef, useState } from 'react';
import { Copy } from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';
import { requestReactCode } from '../gemini/action';

const GeneratePage = () => {
  const prompt = useRef("");
  const [generatedCode, setGeneratedCode] = useState('// サンプルの生成されたReactコンポーネント\nimport React from "react";\n\nconst GeneratedButton = () => {\n  return (\n    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">\n      Click me\n    </button>\n  );\n};\n\nexport default GeneratedButton;');

  // UI関連の状態
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // コピーボタンのUI機能
  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 生成ボタンのUI機能
  const handleGenerate = async () => {
    if (!prompt.current.trim()) return;

    console.log(prompt.current)
    
    setIsGenerating(true);

    const resultCode = await requestReactCode({request : prompt.current.trim()});
    console.log(resultCode);

    setGeneratedCode(resultCode);
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* アプリケーションバー */}
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container flex items-center justify-between">
          <h1 className="text-xl font-bold grow">React Component Builder</h1>
        </div>
      </header>

      {/* メインコンテンツ - 2カラム構成 */}
      <main className="flex-grow flex overflow-hidden">
        {/* 左カラム: プロンプト入力 */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-white">
          <div className="p-4 flex-grow flex flex-col">
            <h2 className="text-lg font-semibold mb-2">プロンプト入力</h2>
            <textarea
              className="flex-grow p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none mb-4"
              placeholder="作成したいコンポーネントの詳細を入力してください..."
              onChange={(e) => prompt.current = e.target.value}
            />
            <button
              className={`w-full py-3 px-4 rounded-md font-medium transition cursor-pointer ${
                isGenerating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? '生成中...' : 'コンポーネントを生成'}
            </button>
          </div>
        </div>

        {/* 右カラム: 生成結果表示 */}
        <div className="w-2/3 bg-gray-50 flex flex-col ">
          <div className="p-4 flex-grow flex flex-col h-screen pb-20">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">生成されたコンポーネント</h2>
              
              <button 
                className={`px-3 py-1 text-sm rounded flex items-center gap-1  cursor-pointer ${
                  isCopied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                onClick={handleCopy}
              >
                <Copy size={16} />
                {isCopied ? 'コピーしました！' : 'コピー'}
              </button>
            </div>
            <div className="flex-grow bg-gray-900 rounded-md">
              {/* Prismを使用したシンタックスハイライト */}
              <Highlight
                theme={themes.nightOwl}
                code={generatedCode}
                language="jsx"
              >
                {({style, tokens, getLineProps, getTokenProps }) => (
                  <pre className="h-full p-4 overflow-scroll" style={{ ...style, backgroundColor: 'transparent' }}>
                    {tokens.map((line, i) => (
                      <div key={i} {...getLineProps({ line, key: i })}>
                        <span className="text-gray-500 inline-block w-8 select-none">{i + 1}</span>
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token, key })} />
                        ))}
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GeneratePage;