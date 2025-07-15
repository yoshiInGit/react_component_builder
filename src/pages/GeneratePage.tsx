import { useEffect, useRef, useState } from 'react';
import { CirclePlus, Copy} from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';
import { v4 as uuidv4 } from 'uuid';
import { requestReactCode } from '../gemini/action';
import Chip from './modules/Chip';
import AddTemplateDialog from './modules/AddTemplateDialog';
import ConfirmDialog from './modules/CofirmDiaolg';

const GeneratePage = () => {
  // UI関連の状態
  const prompt = useRef("");
  const promptTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const [generatedCode, setGeneratedCode] = useState('// サンプルの生成されたReactコンポーネント\nimport React from "react";\n\nconst GeneratedButton = () => {\n  return (\n    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">\n      Click me\n    </button>\n  );\n};\n\nexport default GeneratedButton;');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAddTemplateDialogOpen, setIsAddTemplateDialogOpen] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // テンプレートチップ関連
  type Template = {
    id: string;
    label: string;
    description: string;
  };

  const TEMPLATE_IDS_KEY = 'rcc-templateIds';
  const TEMPLATE_ID_HEADER = 'rcc-template';

  const [templates, setTemplates] = useState<Template[]>([])

  // テンプレートチップの復元
  useEffect(() => {
    const templateIdsStr = localStorage.getItem(TEMPLATE_IDS_KEY);
    if (templateIdsStr) {
      const templateIds = templateIdsStr.split(','); 

      for(const templateId of templateIds) {
        const template = localStorage.getItem(`${TEMPLATE_ID_HEADER}-${templateId}`);
        if (template) {
          const parsedTemplate = JSON.parse(template);
          setTemplates(prev => [...prev, parsedTemplate]);
        }
      }
    }

    return () => {
      setTemplates([]); // クリーンアップ処理（必要に応じて）
    }
  }, []);

  // テンプレートチップの追加
  const addTemplate = ({label, description}:{label:string, description:string}) => {
    const template: Template = {
      id: uuidv4(), // ランダムなIDを生成
      label,
      description
    };

    setTemplates(prev => [...prev, template]);

    // ローカルストレージに保存
    const templateIds = templates.map(t => t.id);
    templateIds.push(template.id);
    localStorage.setItem(TEMPLATE_IDS_KEY, templateIds.join(','));
    localStorage.setItem(`${TEMPLATE_ID_HEADER}-${template.id}`, JSON.stringify(template));
  }

  // テンプレートチップの削除
  const removeTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));

    // ローカルストレージから削除
    const templateIds = templates.map(t => t.id).filter(tId => tId !== id);
    localStorage.setItem(TEMPLATE_IDS_KEY, templateIds.join(','));
    localStorage.removeItem(`${TEMPLATE_ID_HEADER}-${id}`);
  }

  // チップクリック時のプロンプト入力
  const onChipClick = (description: string) => {
    prompt.current = prompt.current + "\n" + description + "\n";
    promptTextAreaRef.current!.value = prompt.current; // テキストエリアに値を設定
    promptTextAreaRef.current!.focus(); // テキストエリアにフォーカスを当てる
  }


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

  // コピーボタンのUI機能
  const handleCopy = () => {
    setIsCopied(true);

    navigator.clipboard.writeText(generatedCode);

    setTimeout(() => setIsCopied(false), 2000);
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
            <div className="flex">
              <h2 className="text-lg font-semibold mb-2 mr-4">テンプレート</h2>
              <CirclePlus className='cursor-pointer'
                onClick={()=>{setIsAddTemplateDialogOpen(true)}}/>
            </div>
            <div className='w-full h-24 flex flex-wrap gap-2 overflow-y-scroll'>
              {templates.map((template) => (
                <Chip 
                  key={template.id} 
                  label={template.label} 
                  onClose={() => {
                    setDeletingTemplate(template);
                    setIsConfirmDialogOpen(true);
                  }}
                  onClick={() => onChipClick(template.description)} 
                />
              ))}


            </div>

            <h2 className="text-lg font-semibold mb-2">プロンプト入力</h2>
            <textarea
              ref={promptTextAreaRef}
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
            <div className="flex-grow bg-gray-900 rounded-md overflow-scroll">
              {/* Prismを使用したシンタックスハイライト */}
              <Highlight
                theme={themes.nightOwl}
                code={generatedCode}
                language="jsx"
              >
                {({style, tokens, getLineProps, getTokenProps }) => (
                  <pre className="h-full p-4" style={{ ...style, backgroundColor: 'transparent' }}>
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

      <AddTemplateDialog
        isOpen={isAddTemplateDialogOpen} 
        onClose={() => {setIsAddTemplateDialogOpen(false)}}
        onSubmit={addTemplate}
      />

      {/* チップ削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title="テンプレートの削除"
        message="このテンプレートを削除しますか？"
        onConfirm={() => {
          if (deletingTemplate) {
            removeTemplate(deletingTemplate.id);
          }
          setIsConfirmDialogOpen(false);
        }}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </div>
  );
};

export default GeneratePage;

