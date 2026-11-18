import { PERSONALITY_LABEL, SPECIES_MAP } from '@/constants/pet';
import type { Pet } from '@/types/services-type/pet.type';
import { formatAge, formatWeight } from '@/utils/format';

/**
 * Bộ trả lời mock "thông minh" cho chế độ offline:
 * khớp từ khóa trong câu hỏi + cá nhân hóa theo hồ sơ thú cưng.
 * Mục tiêu: demo không bao giờ đứng/trắng màn hình kể cả khi mất mạng hay hết credit.
 */

interface Topic {
  keywords: string[];
  answer: (pet: Pet) => string;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd');
}

function dailyKcal(pet: Pet): number {
  // RER = 70 × kg^0.75; hệ số duy trì ~1.6 (chó) / 1.2 (mèo) — số tham khảo, làm tròn.
  const rer = 70 * Math.pow(pet.weightKg, 0.75);
  const factor = pet.species === 'dog' ? 1.6 : pet.species === 'cat' ? 1.2 : 1.4;
  return Math.round((rer * factor) / 10) * 10;
}

const TOPICS: Topic[] = [
  {
    keywords: ['non', 'oi', 'co giat', 'kho tho', 'chay mau', 'ngo doc', 'tieu chay', 'bo an', 'cap cuu', 'li bi', 'sot'],
    answer: (pet) =>
      `⚠️ Nếu ${pet.name} có dấu hiệu nặng (khó thở, co giật, chảy máu, nôn/tiêu chảy liên tục, bỏ ăn quá 24 giờ) hãy **đưa bé đi bác sĩ thú y ngay**.\n\nTrong lúc chờ:\n- Giữ ${pet.name} ở nơi yên tĩnh, thoáng mát\n- Cho uống nước từng ít một nếu bé không nôn\n- Không tự ý cho uống thuốc của người\n- Ghi lại thời điểm, số lần, màu sắc chất nôn/phân để báo bác sĩ`,
  },
  {
    keywords: ['an', 'thuc an', 'khau phan', 'dinh duong', 'hat', 'bua', 'calo', 'kcal', 'beo', 'gay'],
    answer: (pet) => {
      const kcal = dailyKcal(pet);
      const foodie = pet.personalities.includes('foodie');
      return `Với ${pet.name} (${formatWeight(pet.weightKg)}, ${formatAge(pet.ageYears)}), nhu cầu tham khảo khoảng **${kcal} kcal/ngày**.\n\n- Chia **2 bữa** (con non: 3–4 bữa nhỏ)\n- Đọc kcal/100g trên bao bì để quy ra gram\n- Đồ ăn vặt dưới **10%** tổng năng lượng\n- Luôn có nước sạch${foodie ? `\n- ${pet.name} khá ham ăn, dùng bát ăn chậm và cân lượng hạt mỗi bữa nhé` : ''}\n\nTheo dõi cân nặng mỗi 2 tuần để điều chỉnh ±10%.`;
    },
  },
  {
    keywords: ['tam', 've sinh', 'long', 'chai long', 'rung long', 'mong', 'tai', 'rang'],
    answer: (pet) =>
      pet.species === 'cat' || pet.species === 'rabbit' || pet.species === 'hamster'
        ? `${pet.name} là ${SPECIES_MAP[pet.species].label.toLowerCase()} nên **hạn chế tắm nước** — bé tự làm sạch khá tốt.\n\n- Chải lông 2–3 lần/tuần\n- Chỉ lau bằng khăn ẩm khi bị bẩn cục bộ\n- Cắt móng mỗi 2–4 tuần\n- Kiểm tra tai, mắt hàng tuần`
        : `${pet.name} nên tắm khoảng **3–4 tuần/lần**; tắm quá thường làm khô da.\n\n- Dùng sữa tắm riêng cho chó\n- Sấy thật khô, nhất là vùng lông dày\n- Chải lông 2–3 lần/tuần để giảm rụng\n- Cắt móng mỗi 3–4 tuần, vệ sinh tai sau khi tắm`,
  },
  {
    keywords: ['choi', 'van dong', 'di dao', 'tap', 'chan', 'buon', 'nang dong', 'pha'],
    answer: (pet) => {
      const energetic = pet.personalities.some((p) => p === 'energetic' || p === 'playful');
      const shy = pet.personalities.includes('shy');
      const minutes = pet.species === 'dog' ? (energetic ? '60–90' : '30–60') : '15–30';
      return `${pet.name} cần khoảng **${minutes} phút vận động/ngày**, chia nhiều lượt.\n\n- Xen kẽ trò chơi trí tuệ (đồ chơi giấu thưởng)\n- Đổi đồ chơi mỗi vài ngày để bé không chán${energetic ? `\n- ${pet.name} năng lượng cao, thêm trò ném bắt hoặc chạy nhẹ` : ''}${shy ? `\n- ${pet.name} hơi nhút nhát: chơi ở nơi quen thuộc, tăng dần thời gian` : ''}\n\nNếu bé phá đồ, thường là do còn dư năng lượng đó!`;
    },
  },
  {
    keywords: ['tiem', 'vaccine', 'vac xin', 'phong', 'giun', 've', 'bo chet', 'tay giun'],
    answer: (pet) =>
      `Lịch phòng bệnh tham khảo cho ${pet.name}:\n\n- **Tiêm phòng** theo lịch của bác sĩ thú y, nhắc lại hằng năm\n- **Tẩy giun** 3 tháng/lần với thú trưởng thành\n- **Phòng ve, bọ chét** hằng tháng\n\nMình không đưa liều thuốc cụ thể — bác sĩ thú y sẽ chọn loại và liều theo cân nặng ${formatWeight(pet.weightKg)} của bé. Bạn có thể đặt lịch "Tiêm phòng" ngay trong tab Lịch hẹn nhé.`,
  },
  {
    keywords: ['thuoc', 'lieu', 'paracetamol', 'khang sinh', 'uong thuoc'],
    answer: (pet) =>
      `Mình không thể đưa liều thuốc cho ${pet.name} — dùng sai liều rất nguy hiểm, đặc biệt thuốc của người (paracetamol, ibuprofen có thể gây ngộ độc).\n\n- Hãy hỏi trực tiếp bác sĩ thú y\n- Mang theo thông tin cân nặng (${formatWeight(pet.weightKg)}) và triệu chứng\n- Không tự ý ngưng thuốc giữa chừng`,
  },
];

function fallbackAnswer(pet: Pet): string {
  const traits = pet.personalities.map((p) => PERSONALITY_LABEL[p].toLowerCase()).join(', ');
  return `Mình đang ở **chế độ offline** nên chỉ trả lời được các chủ đề cơ bản về ${pet.name} (${SPECIES_MAP[pet.species].label.toLowerCase()} ${pet.breed}, ${formatAge(pet.ageYears)}${traits ? `, ${traits}` : ''}).\n\nBạn thử hỏi về:\n- Ăn uống & khẩu phần\n- Tắm, chải lông, vệ sinh\n- Vận động & đồ chơi\n- Tiêm phòng, tẩy giun\n\nNếu ${pet.name} có dấu hiệu bất thường, hãy liên hệ bác sĩ thú y nhé.`;
}

export function mockAnswer(pet: Pet, question: string): string {
  const q = normalize(question);
  // Ưu tiên topic khẩn cấp (đứng đầu) → khớp nhiều từ khóa nhất.
  let best: Topic | undefined;
  let bestScore = 0;
  for (const topic of TOPICS) {
    const score = topic.keywords.reduce((acc, k) => (new RegExp(`\\b${k}\\b`).test(q) ? acc + 1 : acc), 0);
    if (score > bestScore) {
      best = topic;
      bestScore = score;
    }
  }
  return best ? best.answer(pet) : fallbackAnswer(pet);
}

/** Câu hỏi gợi ý cá nhân hóa theo hồ sơ (chip ở empty state). */
export function suggestionsFor(pet: Pet): string[] {
  const list: string[] = [`${pet.name} nên ăn bao nhiêu mỗi ngày?`];
  if (pet.species === 'dog') list.push(`Bao lâu nên tắm cho ${pet.name} một lần?`);
  else list.push(`Chải lông cho ${pet.name} thế nào cho đúng?`);
  if (pet.personalities.includes('energetic') || pet.personalities.includes('playful'))
    list.push(`Gợi ý trò chơi tiêu hao năng lượng cho ${pet.name}`);
  else if (pet.personalities.includes('shy')) list.push(`Làm sao giúp ${pet.name} bớt nhút nhát?`);
  else list.push(`${pet.name} cần vận động bao nhiêu mỗi ngày?`);
  list.push(pet.ageYears < 1 ? `Lịch tiêm phòng cho bé ${formatAge(pet.ageYears)}?` : `Lịch tẩy giun, tiêm nhắc cho ${pet.name}?`);
  return list;
}
