"use client";

import { useState, useRef } from "react";

type CustomerProfile = {
  age: string;
  propertyType: string;
  area: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

const AGE_OPTIONS = ["指定なし", "20代", "30代", "40代", "50代", "60代以上"];
const PROPERTY_OPTIONS = ["指定なし", "マンション", "一戸建て", "アパート", "単身（1R/1K）"];
const AREA_OPTIONS = ["指定なし", "東京", "神奈川", "埼玉", "千葉", "その他"];

const QUICK_PHRASES = [
  "もう他の業者に頼みました",
  "今忙しいので結構です",
  "値段が高すぎる",
  "自分で調べるので大丈夫です",
  "主人（妻）に相談してから",
  "引越しはまだ先の話なので",
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState<CustomerProfile>({
    age: "指定なし",
    propertyType: "指定なし",
    area: "指定なし",
  });
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isBusy = loading || streaming;

  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content || isBusy) return;

    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // ユーザー送信時のみ下にスクロール
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, profile }),
      });

      if (!res.body) throw new Error("No response body");

      setLoading(false);
      setStreaming(true);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      setMessages([...newMessages, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages([...newMessages, { role: "assistant", content: accumulated }]);
      }
    } catch {
      setLoading(false);
      setMessages([...newMessages, {
        role: "assistant",
        content: "エラーが発生しました。APIキーとネットワークを確認してください。",
      }]);
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            テレアポ 切り返しAIアシスタント
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            断り文句を入力すると、最適な切り返しトークを提案します
          </p>
        </div>
        <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-full font-medium">
          引越しテレアポ特化
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden max-w-5xl w-full mx-auto gap-0">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-5 overflow-y-auto shrink-0">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              顧客プロファイル
            </p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">年代</label>
                <select
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {AGE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">物件種別</label>
                <select
                  value={profile.propertyType}
                  onChange={(e) => setProfile({ ...profile, propertyType: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {PROPERTY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">エリア</label>
                <select
                  value={profile.area}
                  onChange={(e) => setProfile({ ...profile, area: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {AREA_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              よくある断り文句
            </p>
            <div className="flex flex-col gap-2">
              {QUICK_PHRASES.map((phrase) => (
                <button
                  key={phrase}
                  onClick={() => sendMessage(phrase)}
                  disabled={isBusy}
                  className="text-left text-xs text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-200 rounded-lg px-3 py-2 transition-colors disabled:opacity-40"
                >
                  「{phrase}」
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <button
              onClick={() => setMessages([])}
              className="w-full text-xs text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-lg px-3 py-2 transition-colors"
            >
              会話をリセット
            </button>
          </div>
        </aside>

        {/* Chat area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 text-gray-400">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">
                  💬
                </div>
                <div>
                  <p className="font-medium text-gray-600">断り文句を入力してみてください</p>
                  <p className="text-sm mt-1">左のクイック選択か、下のテキストエリアから入力できます</p>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0 mt-1">
                    YOU
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
                  AI
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-5">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white px-6 py-4">
            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="断り文句を入力してください（Shift+Enterで改行）"
                rows={2}
                className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isBusy}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl px-5 py-3 text-sm font-medium transition-colors shrink-0"
              >
                送信
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              顧客プロファイルを設定するとより精度の高い切り返しが生成されます
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
