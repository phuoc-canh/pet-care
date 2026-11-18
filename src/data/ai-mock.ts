import { i18n, type Language } from '@/i18n';
import type { Pet } from '@/types/services-type/pet.type';
import { formatAge, formatNumber, formatWeight } from '@/utils/format';

/**
 * Bộ trả lời mock "thông minh" cho chế độ offline (vi / en / ko):
 * khớp từ khóa (của cả 3 ngôn ngữ) + cá nhân hóa theo hồ sơ thú cưng,
 * trả lời bằng ngôn ngữ đang chọn. Demo không bao giờ đứng khi mất mạng hay AI lỗi.
 */

type TopicId = 'emergency' | 'food' | 'grooming' | 'exercise' | 'vaccine' | 'medicine';

interface Ctx {
  pet: Pet;
  name: string;
  species: string;
  traits: string;
  age: string;
  weight: string;
  kcal: string;
  isDog: boolean;
  foodie: boolean;
  energetic: boolean;
  shy: boolean;
}

/** Từ khóa đã bỏ dấu (vi), chữ thường (en), nguyên dạng (ko). Tiếng Hàn khớp theo chuỗi con. */
const KEYWORDS: Record<TopicId, string[]> = {
  emergency: [
    'non', 'oi', 'co giat', 'kho tho', 'chay mau', 'ngo doc', 'tieu chay', 'bo an', 'cap cuu', 'li bi', 'sot',
    'vomit', 'seizure', 'breath', 'bleed', 'poison', 'diarrhea', 'not eating', 'emergency', 'fever', 'lethargic',
    '구토', '토해', '경련', '호흡', '출혈', '중독', '설사', '안 먹', '응급', '열이', '기운이 없',
  ],
  food: [
    'an', 'thuc an', 'khau phan', 'dinh duong', 'hat', 'bua', 'calo', 'kcal', 'beo', 'gay',
    'eat', 'food', 'feed', 'diet', 'calorie', 'kcal', 'meal', 'weight', 'fat', 'treat',
    '사료', '먹', '식사', '급여', '칼로리', '간식', '비만', '다이어트', '영양',
  ],
  grooming: [
    'tam', 've sinh', 'long', 'chai long', 'rung long', 'mong', 'tai', 'rang',
    'bath', 'wash', 'groom', 'brush', 'shed', 'nail', 'ear', 'teeth', 'fur',
    '목욕', '미용', '빗질', '털', '발톱', '귀', '양치', '씻',
  ],
  exercise: [
    'choi', 'van dong', 'di dao', 'tap', 'chan', 'buon', 'nang dong', 'pha', 'nhut nhat',
    'play', 'exercise', 'walk', 'energy', 'bored', 'toy', 'active', 'shy',
    '놀이', '산책', '운동', '에너지', '심심', '장난감', '낯가림', '활발',
  ],
  vaccine: [
    'tiem', 'vaccine', 'vac xin', 'phong', 'giun', 've', 'bo chet', 'tay giun',
    'vaccin', 'shot', 'booster', 'deworm', 'worm', 'flea', 'tick',
    '접종', '백신', '예방', '구충', '진드기', '벼룩', '심장사상충',
  ],
  medicine: [
    'thuoc', 'lieu', 'paracetamol', 'khang sinh', 'uong thuoc',
    'medicine', 'medication', 'dose', 'dosage', 'pill', 'antibiotic', 'ibuprofen', 'paracetamol',
    '약', '복용', '용량', '항생제', '진통제',
  ],
};

/** Ưu tiên khi bằng điểm: khẩn cấp > thuốc > còn lại. */
const PRIORITY: TopicId[] = ['emergency', 'medicine', 'vaccine', 'food', 'grooming', 'exercise'];

type Answers = Record<TopicId, (c: Ctx) => string> & { fallback: (c: Ctx) => string };

const VI: Answers = {
  emergency: (c) =>
    `⚠️ Nếu ${c.name} có dấu hiệu nặng (khó thở, co giật, chảy máu, nôn/tiêu chảy liên tục, bỏ ăn quá 24 giờ) hãy **đưa bé đi bác sĩ thú y ngay**.\n\nTrong lúc chờ:\n- Giữ ${c.name} ở nơi yên tĩnh, thoáng mát\n- Cho uống nước từng ít một nếu bé không nôn\n- Không tự ý cho uống thuốc của người\n- Ghi lại thời điểm, số lần, màu sắc chất nôn/phân để báo bác sĩ`,
  food: (c) =>
    `Với ${c.name} (${c.weight}, ${c.age}), nhu cầu tham khảo khoảng **${c.kcal} kcal/ngày**.\n\n- Chia **2 bữa** (con non: 3–4 bữa nhỏ)\n- Đọc kcal/100g trên bao bì để quy ra gram\n- Đồ ăn vặt dưới **10%** tổng năng lượng\n- Luôn có nước sạch${c.foodie ? `\n- ${c.name} khá ham ăn, dùng bát ăn chậm và cân lượng hạt mỗi bữa nhé` : ''}\n\nTheo dõi cân nặng mỗi 2 tuần để điều chỉnh ±10%.`,
  grooming: (c) =>
    c.isDog
      ? `${c.name} nên tắm khoảng **3–4 tuần/lần**; tắm quá thường làm khô da.\n\n- Dùng sữa tắm riêng cho chó\n- Sấy thật khô, nhất là vùng lông dày\n- Chải lông 2–3 lần/tuần để giảm rụng\n- Cắt móng mỗi 3–4 tuần, vệ sinh tai sau khi tắm`
      : `${c.name} là ${c.species.toLowerCase()} nên **hạn chế tắm nước** — bé tự làm sạch khá tốt.\n\n- Chải lông 2–3 lần/tuần\n- Chỉ lau bằng khăn ẩm khi bị bẩn cục bộ\n- Cắt móng mỗi 2–4 tuần\n- Kiểm tra tai, mắt hằng tuần`,
  exercise: (c) =>
    `${c.name} cần khoảng **${c.isDog ? (c.energetic ? '60–90' : '30–60') : '15–30'} phút vận động/ngày**, chia nhiều lượt.\n\n- Xen kẽ trò chơi trí tuệ (đồ chơi giấu thưởng)\n- Đổi đồ chơi mỗi vài ngày để bé không chán${c.energetic ? `\n- ${c.name} năng lượng cao, thêm trò ném bắt hoặc chạy nhẹ` : ''}${c.shy ? `\n- ${c.name} hơi nhút nhát: chơi ở nơi quen thuộc, tăng dần thời gian` : ''}\n\nNếu bé phá đồ, thường là do còn dư năng lượng đó!`,
  vaccine: (c) =>
    `Lịch phòng bệnh tham khảo cho ${c.name}:\n\n- **Tiêm phòng** theo lịch của bác sĩ thú y, nhắc lại hằng năm\n- **Tẩy giun** 3 tháng/lần với thú trưởng thành\n- **Phòng ve, bọ chét** hằng tháng\n\nMình không đưa liều thuốc cụ thể — bác sĩ thú y sẽ chọn loại và liều theo cân nặng ${c.weight} của bé. Bạn có thể đặt lịch "Tiêm phòng" ngay trong tab Lịch hẹn nhé.`,
  medicine: (c) =>
    `Mình không thể đưa liều thuốc cho ${c.name} — dùng sai liều rất nguy hiểm, đặc biệt thuốc của người (paracetamol, ibuprofen có thể gây ngộ độc).\n\n- Hãy hỏi trực tiếp bác sĩ thú y\n- Mang theo thông tin cân nặng (${c.weight}) và triệu chứng\n- Không tự ý ngưng thuốc giữa chừng`,
  fallback: (c) =>
    `Mình đang ở **chế độ offline** nên chỉ trả lời được các chủ đề cơ bản về ${c.name} (${c.species.toLowerCase()} ${c.pet.breed}, ${c.age}${c.traits ? `, ${c.traits}` : ''}).\n\nBạn thử hỏi về:\n- Ăn uống & khẩu phần\n- Tắm, chải lông, vệ sinh\n- Vận động & đồ chơi\n- Tiêm phòng, tẩy giun\n\nNếu ${c.name} có dấu hiệu bất thường, hãy liên hệ bác sĩ thú y nhé.`,
};

const EN: Answers = {
  emergency: (c) =>
    `⚠️ If ${c.name} shows serious signs (trouble breathing, seizures, bleeding, repeated vomiting/diarrhea, not eating for over 24 hours), **take them to a vet right away**.\n\nWhile you wait:\n- Keep ${c.name} somewhere quiet and cool\n- Offer small sips of water if they're not vomiting\n- Never give human medicine\n- Note the time, frequency and color of vomit/stool for the vet`,
  food: (c) =>
    `For ${c.name} (${c.weight}, ${c.age}), a rough daily target is about **${c.kcal} kcal**.\n\n- Split into **2 meals** (puppies/kittens: 3–4 small meals)\n- Use the kcal per 100 g on the bag to convert to grams\n- Keep treats under **10%** of daily calories\n- Always have fresh water${c.foodie ? `\n- ${c.name} loves food — try a slow-feeder bowl and weigh each portion` : ''}\n\nWeigh ${c.name} every 2 weeks and adjust by ±10%.`,
  grooming: (c) =>
    c.isDog
      ? `Bathing ${c.name} about **every 3–4 weeks** is plenty; more often can dry out the skin.\n\n- Use a dog-specific shampoo\n- Dry thoroughly, especially thick fur\n- Brush 2–3 times a week to reduce shedding\n- Trim nails every 3–4 weeks and clean ears after baths`
      : `As a ${c.species.toLowerCase()}, ${c.name} **rarely needs a water bath** — they keep themselves pretty clean.\n\n- Brush 2–3 times a week\n- Spot-clean with a damp cloth when needed\n- Trim nails every 2–4 weeks\n- Check ears and eyes weekly`,
  exercise: (c) =>
    `${c.name} needs about **${c.isDog ? (c.energetic ? '60–90' : '30–60') : '15–30'} minutes of activity a day**, split into a few sessions.\n\n- Mix in puzzle games (treat-hiding toys)\n- Rotate toys every few days to keep things fresh${c.energetic ? `\n- ${c.name} has lots of energy — add fetch or a light jog` : ''}${c.shy ? `\n- ${c.name} is a bit shy: play somewhere familiar and build up slowly` : ''}\n\nChewing up stuff usually means there's energy left to burn!`,
  vaccine: (c) =>
    `A general prevention plan for ${c.name}:\n\n- **Vaccines** on your vet's schedule, with yearly boosters\n- **Deworming** every 3 months for adults\n- **Flea & tick prevention** monthly\n\nI can't give specific doses — your vet will choose the product and dose for ${c.name}'s ${c.weight}. You can book a "Vaccination" in the Bookings tab.`,
  medicine: (c) =>
    `I can't give medication doses for ${c.name} — the wrong dose can be dangerous, and human medicines (paracetamol, ibuprofen) can be toxic to pets.\n\n- Please ask your vet directly\n- Bring ${c.name}'s weight (${c.weight}) and symptoms\n- Don't stop a prescribed course early`,
  fallback: (c) =>
    `I'm in **offline mode**, so I can only cover the basics for ${c.name} (${c.species.toLowerCase()}, ${c.pet.breed}, ${c.age}${c.traits ? `, ${c.traits}` : ''}).\n\nTry asking about:\n- Food & portions\n- Bathing, brushing, hygiene\n- Exercise & toys\n- Vaccines & deworming\n\nIf ${c.name} seems unwell, please contact a vet.`,
};

const KO: Answers = {
  emergency: (c) =>
    `⚠️ ${c.name}에게 호흡 곤란, 경련, 출혈, 반복되는 구토·설사, 24시간 이상 식사 거부 같은 증상이 있다면 **바로 동물병원에 가 주세요**.\n\n병원에 가기 전까지:\n- 조용하고 시원한 곳에서 쉬게 해 주세요\n- 구토가 없다면 물을 조금씩 주세요\n- 사람 약은 절대 먹이지 마세요\n- 구토·배변 시간, 횟수, 색을 기록해 수의사에게 알려 주세요`,
  food: (c) =>
    `${c.name}(${c.weight}, ${c.age})의 하루 권장 열량은 약 **${c.kcal}kcal**예요.\n\n- 하루 **2번**으로 나눠 급여해요 (어린 아이는 3~4번 소량씩)\n- 사료 포장지의 100g당 칼로리를 보고 그램으로 계산해요\n- 간식은 하루 열량의 **10% 이내**로 주세요\n- 깨끗한 물은 항상 준비해 주세요${c.foodie ? `\n- 먹보인 ${c.name}에게는 슬로우 식기를 쓰고 매번 사료량을 재 주세요` : ''}\n\n2주마다 몸무게를 재고 ±10% 범위에서 조절해 주세요.`,
  grooming: (c) =>
    c.isDog
      ? `${c.name}의 목욕은 **3~4주에 한 번**이면 충분해요. 너무 자주 하면 피부가 건조해질 수 있어요.\n\n- 강아지 전용 샴푸를 사용해요\n- 털이 두꺼운 부분까지 꼼꼼히 말려 주세요\n- 주 2~3회 빗질하면 털 빠짐이 줄어요\n- 발톱은 3~4주마다 정리하고, 목욕 후 귀 세정도 해 주세요`
      : `${c.species}는 스스로 몸을 잘 관리해서 **물 목욕은 거의 필요 없어요**.\n\n- 주 2~3회 빗질해 주세요\n- 더러워진 부분만 젖은 수건으로 닦아요\n- 발톱은 2~4주마다 정리해요\n- 귀와 눈은 매주 확인해 주세요`,
  exercise: (c) =>
    `${c.name}에게는 **하루 ${c.isDog ? (c.energetic ? '60~90' : '30~60') : '15~30'}분 정도의 활동**이 좋아요. 여러 번 나눠서 해 주세요.\n\n- 노즈워크 같은 두뇌 놀이를 섞어 주세요\n- 장난감은 며칠마다 바꿔 주면 덜 지루해해요${c.energetic ? `\n- 에너지가 넘치는 ${c.name}에게는 공놀이나 가벼운 달리기를 더해 주세요` : ''}${c.shy ? `\n- 낯을 가리는 편이라면 익숙한 장소에서 짧게 시작해 조금씩 늘려 주세요` : ''}\n\n물건을 물어뜯는다면 에너지가 남아 있다는 신호일 수 있어요!`,
  vaccine: (c) =>
    `${c.name}의 기본 예방 관리 일정이에요:\n\n- **예방접종**: 수의사 일정에 맞춰 접종하고 매년 추가 접종해요\n- **구충**: 성견·성묘는 3개월마다\n- **진드기·벼룩 예방**: 매달\n\n정확한 약 용량은 알려 드릴 수 없어요. 수의사가 ${c.name}의 몸무게(${c.weight})에 맞춰 정해 줄 거예요. 예약 탭에서 '예방접종'을 바로 예약할 수 있어요.`,
  medicine: (c) =>
    `${c.name}의 약 용량은 알려 드릴 수 없어요. 잘못된 용량은 위험하고, 특히 사람 약(타이레놀, 이부프로펜 등)은 중독을 일으킬 수 있어요.\n\n- 꼭 수의사에게 직접 문의해 주세요\n- 몸무게(${c.weight})와 증상을 함께 알려 주세요\n- 처방받은 약은 임의로 중단하지 마세요`,
  fallback: (c) =>
    `지금은 **오프라인 모드**라서 ${c.name}(${c.species}, ${c.pet.breed}, ${c.age}${c.traits ? `, ${c.traits}` : ''})에 대해 기본적인 내용만 답할 수 있어요.\n\n이런 걸 물어보세요:\n- 사료와 급여량\n- 목욕, 빗질, 위생 관리\n- 산책과 놀이\n- 예방접종, 구충\n\n${c.name}에게 이상 증상이 보이면 동물병원에 꼭 문의해 주세요.`,
};

const ANSWERS: Record<Language, Answers> = { vi: VI, en: EN, ko: KO };

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .normalize('NFC'); // ghép lại Hangul sau khi NFD tách jamo
}

function matches(q: string, keyword: string): boolean {
  // Hangul không có khoảng trắng giữa từ gốc và trợ từ → khớp chuỗi con.
  if (/[가-힣]/.test(keyword)) return q.includes(keyword);
  return new RegExp(`(^|[^a-z])${keyword}([^a-z]|$)`).test(q);
}

function dailyKcal(pet: Pet): number {
  // RER = 70 × kg^0.75; hệ số duy trì ~1.6 (chó) / 1.2 (mèo) — số tham khảo, làm tròn.
  const rer = 70 * Math.pow(pet.weightKg, 0.75);
  const factor = pet.species === 'dog' ? 1.6 : pet.species === 'cat' ? 1.2 : 1.4;
  return Math.round((rer * factor) / 10) * 10;
}

function buildCtx(pet: Pet): Ctx {
  return {
    pet,
    name: pet.name,
    species: i18n.t(`pet.species.${pet.species}`),
    traits: pet.personalities.map((p) => i18n.t(`pet.personality.${p}`).toLowerCase()).join(', '),
    age: formatAge(pet.ageYears),
    weight: formatWeight(pet.weightKg),
    kcal: formatNumber(dailyKcal(pet)),
    isDog: pet.species === 'dog',
    foodie: pet.personalities.includes('foodie'),
    energetic: pet.personalities.some((p) => p === 'energetic' || p === 'playful'),
    shy: pet.personalities.includes('shy'),
  };
}

export function mockAnswer(pet: Pet, question: string, language: Language): string {
  const q = normalize(question);
  let best: TopicId | null = null;
  let bestScore = 0;
  for (const topic of PRIORITY) {
    const score = KEYWORDS[topic].reduce((acc, k) => (matches(q, normalize(k)) ? acc + 1 : acc), 0);
    if (score > bestScore) {
      best = topic;
      bestScore = score;
    }
  }
  const answers = ANSWERS[language];
  const ctx = buildCtx(pet);
  return best ? answers[best](ctx) : answers.fallback(ctx);
}

/** Câu hỏi gợi ý cá nhân hóa theo hồ sơ (chip ở empty state), theo ngôn ngữ đang chọn. */
export function suggestionsFor(pet: Pet): string[] {
  const name = pet.name;
  const list = [i18n.t('chat.suggest.food', { name })];
  list.push(pet.species === 'dog' ? i18n.t('chat.suggest.bath', { name }) : i18n.t('chat.suggest.groom', { name }));
  if (pet.personalities.includes('energetic') || pet.personalities.includes('playful')) list.push(i18n.t('chat.suggest.play', { name }));
  else if (pet.personalities.includes('shy')) list.push(i18n.t('chat.suggest.shy', { name }));
  else list.push(i18n.t('chat.suggest.exercise', { name }));
  list.push(
    pet.ageYears < 1
      ? i18n.t('chat.suggest.vaccineYoung', { age: formatAge(pet.ageYears) })
      : i18n.t('chat.suggest.deworm', { name }),
  );
  return list;
}
