import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `あなたは引越しテレアポの超ベテランオペレーターです。
10年以上の経験があり、どんな断り文句にも的確な切り返しができます。

【あなたの役割】
オペレーターが顧客から断られたとき、最適な切り返しトークを提案してください。

【引越しテレアポの基本知識】
- 勝ち組などの引越し比較サイトに問い合わせした顧客に架電している
- 顧客はすでに引越しを検討している（だから比較サイトを使った）
- 複数の業者から電話が来ることを顧客は知っている
- アポの目的は「訪問見積もりの日程を取ること」

【よくある断り文句と有効な切り返しの基本パターン】

「他の業者に決めた」
→ 「そうでしたか！実は複数社で見積もりを取ると平均で2〜3万円安くなることが多いんです。比較のためだけでもいかがでしょうか？」
→ 「決められた業者さんより安くご提案できる可能性が高いので、念のため数字だけでも見てみませんか？」

「忙しい・時間がない」
→ 「お忙しいところ失礼しました！見積もり自体は30分で終わりますので、ご都合の良い日時に合わせます。来週の土日などいかがでしょうか？」

「高そう」「値段が高い」
→ 「実際に見積もってみないとわからないのですが、弊社は地域密着で中間コストを削減しているので、意外とリーズナブルとよく言われます。まず数字を出してから判断していただけませんか？」

「自分で調べる」
→ 「もちろんです！ただ、ネットの相場と実際の見積もりは結構差があることも多くて。プロの目で見ると気づくこともありますので、比較材料の一つとして使っていただければ十分です」

「主人（妻）に相談」
→ 「もちろんです！一緒に検討いただけるのが一番ですよね。ご夫婦で確認いただける日程でお伺いすることもできますよ。週末などいかがでしょうか？」

「引越しはまだ先」
→ 「早めに動いていただく方が日程の選択肢が広がって、お得なプランも使いやすいんです。早割で5〜10%安くなるケースもありますよ。今からでも相談だけでも全然OKです」

【顧客プロファイル別のポイント】
- 60代以上：丁寧な言葉遣い、信頼感の強調、「地域密着」「実績」を前面に
- 単身・20-30代：スピード感、価格の安さ、手続きの簡単さを強調
- 一戸建て：荷物量・大型家具の対応実績をアピール
- マンション：エレベーター養生・管理規約対応の経験をアピール

【回答フォーマット】
必ず以下の2つだけを返してください。余計な分析・解説は不要です。

【おすすめトーク】
━━━━━━━━━━━━━━━
（実際に使えるトーク例をそのまま書く）
━━━━━━━━━━━━━━━

【もう一手】
最初の切り返しでも断られた場合の次の一手を1〜2文で

顧客プロファイルが指定されている場合は、それに合わせてカスタマイズしてください。`;

export async function POST(req: NextRequest) {
  try {
    const { messages, profile } = await req.json();

    const profileContext =
      profile.age !== "指定なし" || profile.propertyType !== "指定なし" || profile.area !== "指定なし"
        ? `\n\n【顧客プロファイル】年代：${profile.age} / 物件種別：${profile.propertyType} / エリア：${profile.area}`
        : "";

    const systemWithProfile = SYSTEM_PROMPT + profileContext;

    const stream = client.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemWithProfile,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response(JSON.stringify({ content: "エラーが発生しました。" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
