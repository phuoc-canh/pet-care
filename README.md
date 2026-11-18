# PetPal 🐾

App demo chăm sóc thú cưng: **hồ sơ thú cưng → chat AI cá nhân hóa theo hồ sơ → đặt lịch spa/khám/tiêm phòng**.
Viết bằng React Native + Expo (SDK 58, Expo Router, TypeScript strict), chạy trực tiếp trên **Expo Go** (iOS + Android), không cần build native.
AI đi qua một **Cloudflare Worker** (`worker/`) làm proxy tới RevidAPI (định dạng OpenAI Chat Completions).

| Tính năng | Điểm nhấn kỹ thuật |
|---|---|
| Onboarding 3 slide (chỉ lần đầu) | `Stack.Protected` + Zustand persist, chờ hydrate để không nháy |
| Hồ sơ thú cưng (thêm / sửa / xóa) | TanStack Query + optimistic update, prefetch chi tiết khi nhấn card, form react-hook-form + valibot |
| **Hỏi AI (Pal)** | SSE streaming, nút Dừng, gom token theo frame, fallback offline, lịch sử riêng từng thú cưng |
| Lịch hẹn | Optimistic đặt/hủy + rollback, vuốt để hủy (gesture-handler), animation checkmark |

---

## 1. Chạy app

Yêu cầu: Node 20+, app **Expo Go bản mới nhất** (hỗ trợ SDK 58) trên điện thoại.

```bash
npm install
cp .env.example .env          # điền EXPO_PUBLIC_AI_URL và EXPO_PUBLIC_APP_TOKEN
npx expo start                # quét QR bằng Expo Go (cùng Wi-Fi)
npx expo start --tunnel       # khác mạng / Wi-Fi chặn LAN
```

Không có `.env` app vẫn chạy: chat tự chuyển **chế độ offline** (câu trả lời mock theo hồ sơ).

Kiểm tra chất lượng:

```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor
```

## 2. Worker AI proxy (`worker/`)

```bash
cd worker
npm install
npx wrangler dev              # local, đọc secret từ worker/.dev.vars
npx tsc --noEmit              # typecheck
```

Deploy (token Cloudflare đọc từ `worker/.env`, không nằm trong code):

```bash
cd worker
npx wrangler whoami           # kiểm tra đúng tài khoản trước khi deploy
grep '^REVID_API_KEY=' .dev.vars | cut -d= -f2- | npx wrangler secret put REVID_API_KEY
grep '^APP_TOKEN='     .dev.vars | cut -d= -f2- | npx wrangler secret put APP_TOKEN
npx wrangler deploy
```

| Endpoint | Mô tả |
|---|---|
| `GET /health` | `{ ok: true, model }` |
| `POST /chat` | Header `x-app-token`. Body `{ pet, messages }` → SSE OpenAI (`data: {...}` … `data: [DONE]`) |

Worker làm: kiểm tra `x-app-token` (so sánh thời gian hằng) → rate limit 20 req/phút/IP → validate (≤ 20 tin, ≤ 1000 ký tự/tin, hồ sơ hợp lệ; chỉ gửi 10 tin gần nhất) → dựng system prompt "Pal" từ hồ sơ → gọi RevidAPI `stream: true` (timeout 20s) → **pipe thẳng SSE** về app.
Lỗi upstream được chuẩn hóa thành `{ error, code }`: 402 → `NO_CREDIT`, 429 → `RATE_LIMITED`, còn lại → 502 `UPSTREAM_ERROR` (không lộ chi tiết như "key sai" ra client).
404/503 thì thử lại **một lần** với `AI_FALLBACK_MODEL`; không retry 401/402 (retry vẫn lỗi và tốn credit).

**Chọn model** (đo thực tế qua `/v1/models` + gọi thử cùng một câu hỏi):

| Model | Token đầu | Kết quả |
|---|---|---|
| `claude-haiku-4-5` | 4.5s | ❌ Qua RevidAPI bị bọc system prompt riêng (~10k token): bỏ qua prompt của mình, từ chối tư vấn thú cưng |
| **`google/gemini-flash`** | **3.3s** | ✅ Nhận vai Pal, tiếng Việt tự nhiên, đúng format → **AI_MODEL** |
| `grok-4.5` | 8.5s | ✅ Đủ ý nhưng chậm → **AI_FALLBACK_MODEL** (khác nhà cung cấp, hữu ích khi 503) |
| `deepseek-v4-flash` | 4.8s | ⚠️ Tốn token cho reasoning, bị cắt ở 500 token |

Model đặt trong `vars` của `wrangler.jsonc` → đổi model không cần sửa code.

---

## 3. Kiến trúc

```
route (src/app)  →  view (src/views)  →  hook (src/hooks)  →  service (src/services)  →  libs/http  →  Worker  →  RevidAPI
   chỉ khai báo      ghép hook +          TanStack Query /      mock AsyncStorage           fetch client     proxy, giữ key
   route             components           Zustand / stream      hoặc API thật               chuẩn hóa lỗi
```

Kiến trúc **feature-based** áp dụng lại từ dự án quản lý nhà hàng thật của mình (Next.js, *sgod-restaurant*), chuyển sang mobile. Mỗi domain (`pet`, `chat`, `appointment`) có đủ tầng **type → service → hook → view → components → route**:

```
src/
  app/                    Expo Router — mỗi file chỉ render view tương ứng
    _layout.tsx           Providers (GestureHandler, SafeArea, QueryClient) + ErrorBoundary
    onboarding.tsx  (tabs)/{index,chat,appointment}.tsx  pet/[id].tsx  pet/new.tsx  appointment/book.tsx
  views/<domain>/         Container: ghép hook + components, KHÔNG import service
  components/ui/          Button, Card, Pill, Chip, Avatar, Skeleton, EmptyState, ErrorState, Screen, TextField…
  components/<domain>/    PetCard, PetSelector, PetFormFields, DialogDeletePet, ChatBubble, ChatInput,
                          TypingIndicator, SuggestionChips, DateStrip, TimeSlotGrid, ServiceCard,
                          AppointmentListItem; common/DialogConfirm
  services/               pet / appointment (mock, độ trễ 300–600ms) + ai.service (stream, abort, timeout, fallback)
  libs/                   http.ts (≈ axios instance + interceptor), sse.ts, queryClient.ts, storage.ts
  hooks/services/         usePets, usePet, useCreatePet, useUpdatePet, useDeletePet,
                          useAppointments, useBookAppointment, useCancelAppointment, queryKeys.ts
  hooks/                  useChatStream, useHaptic, useAppState, useSelectedPet
  store/                  Zustand — CHỈ UI state: onboardingDone, selectedPetId, lịch sử chat theo pet
  types/services-type/    <domain>.type.ts + common.type.ts
  theme/ constants/ utils/ data/
```

Tương ứng với bên web: `libs/http.ts` đóng vai trò axios interceptor (base URL + header từ env, timeout, chuẩn hóa mọi lỗi thành `AppError { code }`), `hooks/services` là lớp React Query giống hệt, `services/*` giữ nguyên chữ ký `getAll / getById / create / update / delete` — **thay mock bằng API thật chỉ sửa thân hàm trong service, không đụng hook/view**.

---

## 4. Quyết định kỹ thuật & lý do

### TanStack Query vs Zustand
- **Server state** (thú cưng, lịch hẹn, giờ đã kín) → TanStack Query: cache, `staleTime` 30s, `placeholderData` giữ dữ liệu cũ khi refetch, retry, invalidate theo `queryKeys`, optimistic update.
- **UI state** (đã xem onboarding, thú cưng đang chọn, lịch sử chat) → Zustand + persist AsyncStorage, đọc bằng **selector** để component chỉ re-render khi đúng field đổi.
- Không trộn: `useSelectedPet` ghép danh sách (Query) với id đang chọn (Zustand); id không còn tồn tại → tự rơi về con đầu tiên.

### Streaming SSE + abort + gom token theo frame
- `libs/sse.ts`: parser incremental — nhận mảnh text bất kỳ (cắt giữa dòng/giữa JSON), chỉ lấy `choices[0].delta.content`, bỏ chunk rỗng/`reasoning_content`, dừng ở `[DONE]`.
- `useChatStream`: token đi vào **buffer trong `ref`**; một vòng `requestAnimationFrame` mỗi frame lấy một phần buffer ra hiển thị (tốc độ tỉ lệ độ dài buffer) → **tối đa 1 lần cập nhật/frame**, không setState mỗi ký tự.
- Text đang stream nằm trong một "text store" nhỏ, **chỉ `StreamingBubble` subscribe** (`useSyncExternalStore`) → mỗi frame chỉ bubble đó render lại; danh sách (FlatList inverted, item `memo`) và ô input đứng yên. Store Zustand chỉ được ghi **một lần** khi câu trả lời xong (không ghi AsyncStorage mỗi frame).
- `AbortController`: nút **Dừng** (giữ phần đã hiện), đổi thú cưng, rời tab chat (`useFocusEffect`), app vào background (`AppState`) đều hủy request.
- Timeout: 15s cho token đầu, sau đó 20s không có dữ liệu thì coi là treo. Không dùng `AbortSignal.timeout/any` vì Hermes chưa hỗ trợ đủ — tự gộp signal trong `createTimeoutController`.

### Đọc stream trên Expo Go
`fetch` mặc định của React Native **không có `response.body`** (không stream được). Thứ tự đã cân nhắc:
1. **`fetch` từ `expo/fetch`** ← chọn. Từ SDK 52 Expo có fetch native trả `ReadableStream` thật (`res.body.getReader()`), có sẵn trong Expo Go, hỗ trợ `AbortSignal`, chạy cả iOS/Android/web. `TextDecoder` được Expo cài sẵn trên Hermes.
2. `XMLHttpRequest` + `onprogress`: chạy được nhưng `responseText` tích lũy (phải tự cắt offset), khó hủy sạch, hành vi khác nhau giữa iOS/Android → không cần nữa.
3. Non-stream + giả lập: vẫn giữ làm **đường lui** — nếu môi trường không trả `body`, service đọc `res.text()` rồi parse một lần.

Phát hiện khi đo: RevidAPI thường **gom xong câu trả lời rồi mới gửi** (time-to-first-byte ≈ tổng thời gian). Nhờ bộ đệm theo frame ở trên, câu trả lời đến "một cục" vẫn hiện ra như đang gõ, nên trải nghiệm streaming giữ nguyên dù upstream có buffer hay không.

### Fallback offline — demo không bao giờ đứng
`aiService.sendMessage` **không ném lỗi ra UI** (trừ khi người dùng tự hủy). Mất mạng / timeout / 4xx / 5xx / thiếu env → chuyển sang câu trả lời mock "thông minh" (`data/ai-mock.ts`: khớp từ khóa có bỏ dấu tiếng Việt + cá nhân hóa theo cân nặng, loài, tính cách; ưu tiên chủ đề khẩn cấp), phát ra từng cụm như AI thật. UI hiện badge **"Chế độ offline"**, dòng thông báo thân thiện theo mã lỗi (hết credit / đang bận / AI tạm lỗi…) và nút **Thử lại**. Câu trả lời offline không được gửi lại làm lịch sử cho AI. Thêm `ErrorBoundary` ở root + `ErrorState` có nút "Thử lại" cho từng màn.

### Optimistic update
Thêm/sửa/xóa thú cưng và đặt/hủy lịch: `onMutate` hủy query đang chạy → chụp snapshot → cập nhật cache ngay → `onError` rollback → `onSettled` invalidate để đồng bộ với server. Modal đóng ngay sau khi bấm Lưu; dùng `mutateAsync().then()` thay vì callback của `mutate()` vì callback đó **không chạy nếu component đã unmount**. Đặt lịch thì chờ kết quả (300–600ms, có loading) vì cần báo lỗi "giờ vừa có người đặt" tại chỗ.

### Vì sao API key nằm ở Worker, không ở app
Mọi thứ trong bundle app (kể cả biến `EXPO_PUBLIC_*`) đều **giải nén được** từ file APK/IPA. Key RevidAPI mà nằm trong app thì ai cũng lấy được và tiêu credit. Worker giữ key dưới dạng secret, đồng thời là nơi đặt prompt, validate input, rate limit, đổi model/nhà cung cấp mà **không phải phát hành lại app**.

### Giới hạn của APP_TOKEN và hướng production
`APP_TOKEN` chỉ là **lớp chặn tối thiểu cho demo**: nó cũng nằm trong bundle nên không phải bí mật thật; rate limit dùng `Map` trong memory theo từng isolate nên không chính xác tuyệt đối. Hướng production:
- Người dùng đăng nhập → backend cấp **JWT ngắn hạn** (access + refresh); Worker verify chữ ký JWT (JWKS) thay cho `APP_TOKEN`, rate limit/quota **theo user** thay vì theo IP.
- Rate limit bằng Cloudflare Rate Limiting binding / Durable Objects; thêm App Attest / Play Integrity để chống client giả.
- Lưu lịch sử chat & hồ sơ ở backend (hiện là AsyncStorage), log usage/cost theo user.

### Hiệu năng & độ mượt
- FlatList: `keyExtractor` ổn định, item `React.memo`, `renderItem`/callback qua `useCallback`, style qua `StyleSheet.create` (không tạo object trong renderItem); chat dùng `inverted` + `maintainVisibleContentPosition` khi người dùng đang đọc tin cũ (không giật), nút "↓ Tin mới".
- Animation bằng Reanimated (scale khi nhấn, skeleton, typing dots, checkmark, layout transition) chạy trên UI thread.
- `AppState` nối `focusManager` → quay lại app thì query stale được refetch nhẹ.
- `KeyboardAvoidingView` (`padding` iOS / `height` Android) — tính theo phần bàn phím đè lên chính view nên đúng cả khi màn nằm trên tab bar; form ẩn bàn phím khi chạm ra ngoài.
- Accessibility: mọi nút chỉ có icon đều có `accessibilityLabel`, vùng chạm ≥ 44×44 (hoặc `hitSlop`), chữ phụ dùng `#5F6670` (tương phản ≥ 4.5:1 trên nền trắng); `#9AA0A6` chỉ cho placeholder/trạng thái disabled.

---

## 5. Bảo mật repo
- `.env`, `.env*.local`, `worker/.env`, `worker/.dev.vars`, `worker/.wrangler/` đều trong `.gitignore` (`git check-ignore -v .env worker/.env worker/.dev.vars`).
- `.env` của app **chỉ** có `EXPO_PUBLIC_AI_URL` và `EXPO_PUBLIC_APP_TOKEN`. Token Cloudflare và key RevidAPI không bao giờ vào app hay vào git.
- `wrangler.jsonc` không chứa `account_id` hay secret; wrangler đọc `CLOUDFLARE_*` từ `worker/.env`.
