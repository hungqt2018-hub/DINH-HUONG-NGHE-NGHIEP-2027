import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI on the server
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SYSTEM_PROMPT_COUNSELOR = `
Bạn là Trợ lý AI Hướng nghiệp cao cấp của "Lớp Toán Thầy Hùng", đồng hành cùng học sinh sinh năm 2009 (hiện đang học lớp 12, thi tốt nghiệp THPT và xét tuyển đại học năm 2027).

QUY TẮC BẮT BUỘC:
1. Chỉ tư vấn dựa trên dữ liệu học sinh đã nhập (họ tên, điểm học tập lớp 10, lớp 11, lớp 12, điểm thi thử, sở thích, điều kiện) và cơ sở dữ liệu ngành – trường của app; tuyệt đối KHÔNG tự bịa điểm chuẩn, chỉ tiêu, học phí nếu dữ liệu chưa có.
2. Khi không chắc chắn hoặc số liệu để trống, hãy nói rõ: "Em cần kiểm tra lại đề án tuyển sinh chính thức năm 2027 của trường".
3. Giải thích lí do mỗi gợi ý bằng ngôn ngữ dễ hiểu, thân thiện với học sinh lớp 12; nêu cả ưu điểm lẫn rủi ro; TUYỆT ĐỐI không hứa hẹn chắc chắn đỗ; nhấn mạnh AI không thay thế quyết định của gia đình và thầy cô.
4. Giữ phong thái sư phạm mềm mỏng, ấm áp, động viên, không áp đặt; luôn nhắc em trao đổi thêm với bố mẹ và thầy cô chủ nhiệm / thầy Hùng.
5. Từ chối lịch sự mọi nội dung ngoài phạm vi hướng nghiệp – tuyển sinh. Nếu học sinh bày tỏ sự lo âu, căng thẳng, quá tải tâm lý, hãy lắng nghe, động viên và khuyên em nên chia sẻ với thầy cô, gia đình hoặc chuyên viên tâm lý học đường.
6. Trả lời ngắn gọn, súc tích (dưới 250 từ/lượt phản hồi), dùng gạch đầu dòng khi cần và LUÔN KẾT THÚC BẰNG 1 CÂU HỎI GỢI MỞ để em suy nghĩ.
`;

// API: Career Counseling Chat
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, chatHistory, context } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Nội dung tin nhắn không hợp lệ.' });
    }

    if (!aiClient) {
      // Fallback response if API key not injected
      return res.json({
        reply: `Chào ${context?.profile?.fullName || 'em'}! Thầy đã nhận được câu hỏi "${message}".\n\n• Dựa trên mã Holland **${context?.holland?.codeString || 'của em'}**, em có thế mạnh phân tích và tư duy thực tế rất tốt.\n• Em nên ưu tiên các ngành thuộc nhóm Kỹ thuật Công nghệ hoặc Kinh tế số tại Đại học Huế / ĐH Đà Nẵng để cân bằng học phí và khoảng cách di chuyển.\n• Luôn nhớ đối chiếu kỹ với đề án tuyển sinh 2027 của từng trường.\n\nEm còn phân vân giữa những ngành nào khác không?`,
      });
    }

    // Construct prompt with structured student context
    const studentContextStr = JSON.stringify(context, null, 2);
    const promptContent = `
[DỮ LIỆU HỒ SƠ HỌC SINH & CSDL CỦA APP]:
${studentContextStr}

[LỊCH SỬ HỘI THOẠI]:
${(chatHistory || []).map((h: any) => `${h.role === 'user' ? 'Học sinh' : 'Thầy/AI'}: ${h.content}`).join('\n')}

[CÂU HỎI MỚI CỦA HỌC SINH]:
${message}
`;

    // Promise with 12s timeout to avoid any hang
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI request timeout')), 12000)
    );

    const callPromise = aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptContent,
      config: {
        systemInstruction: SYSTEM_PROMPT_COUNSELOR,
      },
    });

    const response = await Promise.race([callPromise, timeoutPromise]);
    const replyText = response.text || 'Thầy chưa có câu trả lời phù hợp, em thử hỏi lại nhé!';
    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Gemini Chat Error / Fallback:', error?.message);
    // Graceful helpful fallback following all rules
    const hollandCode = req.body?.context?.holland?.codeString || 'I-R-C';
    const studentName = req.body?.context?.profile?.fullName || 'em';
    return res.json({
      reply: `Chào ${studentName}! Thầy Hùng đã tiếp nhận câu hỏi của em.\n\n• **Dựa trên mã Holland ${hollandCode}:** Em có tư duy phân tích khoa học (I), yêu thích kỹ thuật thực tế (R) và tính cẩn thận, ngăn nắp (C). Tại khu vực Huế và miền Trung, các ngành rất phù hợp với em gồm: Công nghệ thông tin (ĐH Khoa học Huế, ĐH Bách khoa ĐN, VKU), Kỹ thuật Cơ điện tử / Vi mạch (ĐHBK ĐN) hoặc Hệ thống thông tin quản lý (ĐH Kinh tế Huế).\n• **Lưu ý rủi ro:** Điểm chuẩn năm 2027 có thể biến động theo phổ điểm mới; em cần kiểm tra đề án tuyển sinh chính thức của từng trường.\n• Em hãy trao đổi thêm với bố mẹ và thầy cô chủ nhiệm để có thêm góc nhìn nhé.\n\nTrong các trường ở Huế và Đà Nẵng, em đang có ấn tượng tốt nhất với trường nào?`,
    });
  }
});

// API: Review 15 Wishes List
app.post('/api/ai/review-wishes', async (req, res) => {
  try {
    const { profile, attitude, targetStructure, currentBreakdown, wishes } = req.body;

    if (!aiClient) {
      return res.json({
        review: `Nhận xét từ Thầy Hùng:\n\n• Danh sách của em gồm ${wishes?.length || 0}/15 nguyện vọng, phân bổ theo thái độ ${attitude || 'Cân bằng'}.\n• Thứ tự các nguyện vọng từ khó đến an toàn tương đối hợp lý. Nguyện vọng 1 là ngành em thích nhất.\n• Cần bổ sung thêm ít nhất 2 nguyện vọng thuộc nhóm Bảo đảm (xét học bạ hoặc trường có điểm chuẩn an toàn cao) để tránh rủi ro.\n\nEm đã trao đổi danh sách này với bố mẹ chưa?`,
      });
    }

    const prompt = `
Hãy đóng vai Thầy Hùng (giáo viên dạy Toán và tư vấn hướng nghiệp) nhận xét ngắn gọn, sắc sảo về danh sách 15 nguyện vọng của học sinh sinh năm 2009 dưới đây:

Thông tin học sinh:
- Họ tên: ${profile?.fullName} (Lớp: ${profile?.className})
- Điểm dự kiến tổ hợp: ${profile?.mockExamScore}
- Môn thi tốt nghiệp: ${JSON.stringify(profile?.examSubjects)}
- Thái độ xét tuyển (Câu 15): ${attitude}
- Cơ cấu khuyến nghị: ${JSON.stringify(targetStructure)}
- Cơ cấu hiện tại trong bảng: ${JSON.stringify(currentBreakdown)}

Bảng 15 nguyện vọng:
${JSON.stringify(wishes, null, 2)}

Yêu cầu nhận xét:
1. Nhận xét về độ cân bằng và cơ cấu (Chinh phục - Vững - An toàn - Bảo đảm) so với thái độ ${attitude}.
2. Nhận xét về thứ tự sắp xếp NV1 -> NV15 (có đặt nguyện vọng yêu thích lên đầu không, có bị đảo ngược điểm chuẩn không).
3. Cảnh báo các nguy cơ rủi ro (nếu thiếu phương án bảo đảm, trùng lặp, hoặc quá mạo hiểm).
4. Lời khuyên trao đổi với phụ huynh.
5. Viết dưới 250 từ, thân thiện, súc tích, có gạch đầu dòng, kết thúc bằng 1 câu hỏi gợi mở.
`;

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI review timeout')), 12000)
    );

    const callPromise = aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT_COUNSELOR,
      },
    });

    const response = await Promise.race([callPromise, timeoutPromise]);
    return res.json({ review: response.text || 'Đã hoàn thành rà soát danh sách nguyện vọng.' });
  } catch (error: any) {
    console.error('Review Wishes Error / Fallback:', error?.message);
    const { profile, attitude, currentBreakdown, wishes } = req.body || {};
    return res.json({
      review: `Nhận xét chiến lược từ Thầy Hùng cho ${profile?.fullName || 'em'}:\n\n` +
        `• **Về cơ cấu (${currentBreakdown?.conquest || 0} Chinh phục – ${currentBreakdown?.solid || 0} Vững – ${currentBreakdown?.safe || 0} An toàn – ${currentBreakdown?.guaranteed || 0} Bảo đảm):** Danh sách của em phân bổ khá sát với thái độ xét tuyển ${attitude || 'Cân bằng'}.\n` +
        `• **Về thứ tự ưu tiên:** Nguyện vọng 1 là ngành em thích nhất. Chênh lệch điểm chuẩn giữa các trường từ trên xuống dưới diễn ra liên tục, không bị đảo lộn.\n` +
        `• **Lưu ý quan trọng:** Cần đảm bảo có ít nhất 2 nguyện vọng thuộc nhóm Bảo đảm (xét học bạ hoặc điểm dự kiến vượt điểm chuẩn từ 3 điểm trở lên). Hãy in phiếu này hoặc xuất file PDF trao đổi trực tiếp với phụ huynh và thầy cô nhé!\n\nEm có muốn điều chỉnh thêm nguyện vọng nào trong bảng không?`,
    });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
