import { GoogleGenAI } from "@google/genai";
const geminiAi = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const requestReactCode = async ({request} : {request : string}) => {
    const response = await geminiAi.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt({request : request}),
    });

    console.log(response.text);

    return extractCodeBlock(response.text ?? "");
}

const prompt = ({request} : {request : string}) => {
    return `
あなたは熟練のフロントエンドエンジニアです。以下の要件に従ってReactコンポーネントを作成してください。

#要件
${request}

#出力形式
- 出力するコードを <CODE> </CODE> で囲んで
- 出力するコードはコードブロックで囲まず、純粋なテキスト形式で出力して

<example>
<CODE>
import ...
const Button = () => {..
</CODE>

<CODE>
import React from "react";

const GeneratedButton = () => {
  return (
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Click me
    </button>
  );
};

export default GeneratedButton;
</CODE>


</example>

`
}


const extractCodeBlock = (text: string): string  => {
    const match = /<CODE>(.*?)<\/CODE>/s.exec(text);
    if (match) {
      return match[1];
    } else {
      return "コードの生成に失敗しました";
    }
}