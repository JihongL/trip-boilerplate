import type { TripConfig } from "./types";
import meta from "./trip.meta.json";

export const tripConfig: TripConfig = {
  meta: meta as TripConfig["meta"],
  tripStart: "2026-03-20T00:00:00+07:00",
  tripEnd: "2026-03-23T23:59:59+07:00",
  mapCenter: [15.97, 108.18],
  mapZoom: 11,
  areas: ["다낭", "호이안"],
  areaBadgeColors: {
    "호이안": { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" },
    "다낭": { bg: "bg-sky-100", text: "text-sky-800", border: "border-sky-200" },
  },
  locationGradients: {
    "호이안": { gradient: "linear-gradient(135deg, hsl(35, 80%, 52%) 0%, hsl(25, 90%, 55%) 100%)" },
    "다낭": { gradient: "linear-gradient(135deg, hsl(200, 70%, 48%) 0%, hsl(210, 80%, 55%) 100%)" },
  },
  parentTipLabel: "서여사 · 이서방 체크!",
  headerLabel: "서여사 생신기념 여행",
  footerText: "jihong.lee@outlook.com",

  pledge: {
    title: "우리 가족 베트남 여행 10계명",
    pledgeText: "위 내용을 충실히 이행할 것을 약속합니다.",
    participationQuestion: "참가하시겠습니까?",
    acceptText: "당연하죠! 참가합니다 ✈️",
    declineText: "글쎄요...",
    declineMessages: [
      "다시 한번 생각해보세요... 🤔",
      "진심이세요?! 다낭인데요?! 🏖️",
      "서여사님 이러시면 안 됩니다 😭",
      "마지막 기회입니다... 진짜요?",
      "알겠습니다... (참가 버튼이 커집니다)",
    ],
    introGreeting: "서여사님 생신 축하드립니다! 🎂",
    introTitle: "우리 가족 베트남 여행",
    introDescription: "자녀들이 준비한 특별한 여행에",
    rulesHeaderTitle: "서여사 · 이서방 여행 10계명",
    rulesHeaderSubtitle: "서여사 · 이서방과 함께하는 다낭 · 호이안",
  },

  rules: [
    { num: "하나", text: "아직 멀었냐 금지" },
    { num: "둘", text: "음식이 달다 금지" },
    { num: "셋", text: "음식이 짜다 금지" },
    { num: "넷", text: "겨우 이거 보러 왔냐 금지" },
    { num: "다섯", text: "조식 이게 다냐 금지" },
    { num: "여섯", text: "돈 아깝다 금지" },
    { num: "일곱", text: "이 돈이면 집에서 해먹는게 낫다 금지" },
    { num: "여덟", text: "이거 무슨맛으로 먹냐 금지" },
    { num: "아홉", text: "이거 한국 돈으로 얼마냐 금지" },
    { num: "열", text: "물이 제일 맛있다 금지" },
  ],

  schedule: [
    {
      day: 1, date: "3월 20일", weekday: "금", title: "호이안 도착 & 올드타운", location: "호이안", hotelIndex: 0,
      schedule: [
        { time: "06:45", activity: "인천공항 집합", detail: "터미널 2", type: "flight" },
        { time: "09:45", activity: "인천 출발 (KE5769)", type: "flight" },
        { time: "12:30", activity: "다낭 도착", type: "flight" },
        { time: "13:00", activity: "호이안으로 이동", detail: "차량 약 40분", type: "move" },
        { time: "14:00", activity: "호텔 체크인 & 휴식", type: "stay" },
        { time: "16:00", activity: "올드타운 가이드 투어", detail: "일본교 · 중국회관 · 상인 집", type: "activity" },
        { time: "18:00", activity: "저녁 식사", detail: "White Rose · Cao Lau · Mi Quang", type: "food" },
        { time: "19:00", activity: "소원보트 + 야시장", type: "activity" },
      ],
      meals: ["점심: 기내식 또는 도착 후 간단히", "저녁: 호이안 올드타운"],
      parentTip: "도착 후 충분히 쉬고 나서 관광 시작. 무리하지 않기!",
      preparation: ["선크림", "모자", "편한 신발", "물병"],
    },
    {
      day: 2, date: "3월 21일", weekday: "토", title: "액티비티 & 휴식", location: "호이안", hotelIndex: 0,
      schedule: [
        { time: "08:00", activity: "조식", type: "food" },
        { time: "09:30", activity: "코코넛 보트 체험", detail: "대나무 보트로 수로 탐험", type: "activity" },
        { time: "12:00", activity: "점심 식사", type: "food" },
        { time: "13:30", activity: "호텔 수영장 / 마사지", detail: "서여사 · 이서방 휴식 · 스파 추천", type: "stay" },
        { time: "17:00", activity: "올드타운 재방문 + 저녁", type: "activity" },
      ],
      meals: ["조식: 호텔", "점심: 호이안 로컬", "저녁: 올드타운"],
      parentTip: "오후는 완전 자유시간. 서여사 · 이서방 컨디션에 맞춰 휴식 우선!",
      preparation: ["수영복", "갈아입을 옷", "카메라", "선크림"],
    },
    {
      day: 3, date: "3월 22일", weekday: "일", title: "다낭 이동 & 해변", location: "다낭", hotelIndex: 1,
      schedule: [
        { time: "08:00", activity: "조식", type: "food" },
        { time: "09:00", activity: "호이안 체크아웃", detail: "Little Oasis Hotel", type: "stay" },
        { time: "10:00", activity: "다낭으로 이동", detail: "차량 약 40분", type: "move" },
        { time: "12:00", activity: "다낭 점심", type: "food" },
        { time: "14:00", activity: "해변 액티비티", detail: "서여사 · 이서방은 해변에서 휴식도 OK", type: "activity" },
        { time: "15:00", activity: "노보텔 체크인", detail: "Novotel Danang Premier Han River", type: "stay" },
        { time: "18:00", activity: "다낭 시내 저녁 식사", type: "food" },
      ],
      meals: ["조식: 호텔", "점심: 다낭", "저녁: 다낭 시내"],
      parentTip: "해변에서 무리하지 말고, 그늘에서 쉬는 시간도 갖기",
      preparation: ["수영복", "선크림", "모자", "샌들"],
    },
    {
      day: 4, date: "3월 23일", weekday: "월", title: "선택 일정 & 귀국", location: "다낭", hotelIndex: 1,
      schedule: [
        { time: "08:00", activity: "조식", type: "food" },
        { time: "09:00", activity: "바나힐 or 자유시간", detail: "컨디션 안 좋으면 카페에서 휴식", type: "activity" },
        { time: "12:00", activity: "점심", type: "food" },
        { time: "13:00", activity: "공항 이동", type: "move" },
        { time: "15:45", activity: "다낭 출발 (KE0458)", type: "flight" },
        { time: "22:05", activity: "인천 도착", type: "flight" },
      ],
      meals: ["조식: 호텔", "점심: 간단히", "저녁: 기내식"],
      parentTip: "마지막 날은 무리하지 않기! 공항 일찍 가서 면세점 구경",
      preparation: ["여권", "탑승권", "기념품 정리"],
    },
  ],

  hotels: [
    { name: "Little Oasis Hotel", address: "215 Lê Thánh Tông, Hội An", area: "호이안", checkIn: "3/20 (금) 14:00", checkOut: "3/22 (일) 12:00", lat: 15.8794, lng: 108.3350 },
    { name: "Novotel Danang Premier", address: "36 Bach Dang St, Đà Nẵng", area: "다낭", checkIn: "3/22 (일) 15:00", checkOut: "3/23 (월) 12:00", lat: 16.0681, lng: 108.2240 },
  ],

  flights: [
    {
      direction: "outbound", label: "가는편", airline: "대한항공 KE5769",
      fromCode: "ICN", fromCity: "인천", departTime: "09:45",
      toCode: "DAD", toCity: "다낭", arriveTime: "12:30",
      duration: "4시간 45분", dayIndex: 0,
      note: "진에어(LJ) 카운터에서 탑승수속! 대한항공 코드셰어 · 터미널 2",
    },
    {
      direction: "inbound", label: "오는편", airline: "대한항공 KE0458",
      fromCode: "DAD", fromCity: "다낭", departTime: "15:45",
      toCode: "ICN", toCity: "인천", arriveTime: "22:05",
      duration: "4시간 20분", dayIndex: 3,
    },
  ],

  checklist: [
    { text: "여권 (유효기간 6개월 이상)" },
    { text: "항공권 정보 저장" },
    { text: "환전 (베트남 동)" },
    { text: "유심/eSIM 준비" },
    { text: "여행자 보험 가입" },
    { text: "호텔 예약 확인서" },
    { text: "Grab 앱 설치" },
    { text: "상비약 챙기기" },
    { text: "선크림 & 모자" },
  ],

  packingGuide: {
    clothing: [
      "낮: 반팔/반바지 (평균 25~30°C)",
      "저녁: 얇은 긴팔 하나 (에어컨/바람)",
      "비 올 수 있으니 우산 또는 우비",
      "호이안 사원 방문 시 긴바지 필요",
      "편한 운동화 + 샌들/슬리퍼",
    ],
    luggage: [
      "위탁 수하물: 23kg × 1개 (대한항공)",
      "기내 반입: 12kg 이내, 55×40×20cm",
      "3박이라 24인치면 충분",
      "기념품 공간 여유 두기",
      "보조배터리는 기내 반입만 가능",
    ],
  },

  pois: [
    { emoji: "✈️", name: "다낭 국제공항 (DAD)", category: "공항", area: "다낭", description: "베트남 중부 주요 공항", why: "입출국 공항", address: "Da Nang International Airport", visitTime: "입출국 시", transport: "택시/Grab 이용", familyNote: "작은 공항이라 이동이 편해요", lat: 16.0556, lng: 108.1992 },
    { emoji: "🏨", name: "Little Oasis Hotel", category: "숙소 (3/20~22)", area: "호이안", description: "에코 프렌들리 호텔 & 스파", why: "호이안 숙소", address: "215 Lê Thánh Tông, Hội An", visitTime: "3/20~22", transport: "공항에서 택시 40분", familyNote: "올드타운 가까워 이동 편리", lat: 15.8794, lng: 108.3350 },
    { emoji: "🏨", name: "Novotel Danang Premier", category: "숙소 (3/22~23)", area: "다낭", description: "한강변 5성급 호텔", why: "다낭 숙소", address: "36 Bach Dang St, Đà Nẵng", visitTime: "3/22~23", transport: "공항에서 택시 10분", familyNote: "한강뷰, 수영장, 조식 뷔페 우수", lat: 16.0681, lng: 108.2240 },
    { emoji: "🏛️", name: "호이안 올드타운", category: "관광지", area: "호이안", description: "유네스코 세계문화유산", why: "호이안의 핵심 관광지", address: "Hoi An Ancient Town", visitTime: "2~3시간", transport: "호텔에서 도보 10분", familyNote: "평지라 걷기 편하고 야경이 아름다워요", lat: 15.8773, lng: 108.3280 },
    { emoji: "🌉", name: "일본교 (내원교)", category: "관광지", area: "호이안", description: "호이안 상징적 다리", why: "호이안 대표 랜드마크", address: "Japanese Covered Bridge, Hoi An", visitTime: "20분", transport: "올드타운 내 도보", familyNote: "사진 포인트! 낮과 밤 다른 분위기", lat: 15.8770, lng: 108.3262 },
    { emoji: "🚤", name: "코코넛 보트", category: "액티비티", area: "호이안", description: "대나무 바구니 보트 체험", why: "재미있는 수상 액티비티", address: "Cam Thanh, Hoi An", visitTime: "1~2시간", transport: "호텔에서 차로 15분", familyNote: "서여사 · 이서방도 즐길 수 있는 안전한 체험", lat: 15.8630, lng: 108.3410 },
    { emoji: "🏖️", name: "미케 비치", category: "해변", area: "다낭", description: "다낭 대표 해변", why: "해변 액티비티 & 휴식", address: "My Khe Beach, Da Nang", visitTime: "2~3시간", transport: "다낭 시내에서 가까움", familyNote: "깨끗하고 넓은 해변. 그늘 있는 곳에서 쉬기", lat: 16.0470, lng: 108.2500 },
    { emoji: "🎡", name: "바나힐", category: "관광지", area: "다낭", description: "골든 브릿지로 유명한 테마파크", why: "컨디션 따라 선택 관광", address: "Ba Na Hills, Da Nang", visitTime: "3~4시간", transport: "다낭에서 차로 40분", familyNote: "케이블카 탑승. 선선한 기후가 장점", lat: 15.9977, lng: 107.9875 },
    { emoji: "🛍️", name: "호이안 야시장", category: "시장", area: "호이안", description: "등불과 기념품의 야시장", why: "쇼핑 & 야경 & 소원보트", address: "Nguyen Hoang, Hoi An", visitTime: "1~2시간", transport: "올드타운 내 도보", familyNote: "흥정 가능. 소원보트 체험 추천!", lat: 15.8768, lng: 108.3274 },
    { emoji: "🌉", name: "용다리 (Dragon Bridge)", category: "관광지", area: "다낭", description: "불 뿜는 용 모양 다리", why: "다낭 상징 랜드마크", address: "Dragon Bridge, Da Nang", visitTime: "30분 (주말 밤 불쇼)", transport: "노보텔에서 도보 5분", familyNote: "주말 밤 9시 불쇼! 가까이서 보면 더 멋져요", lat: 16.0612, lng: 108.2278 },
    { emoji: "🛍️", name: "한시장 (Han Market)", category: "시장", area: "다낭", description: "다낭 대표 재래시장", why: "기념품 & 현지 물건 쇼핑", address: "119 Trần Phú, Da Nang", visitTime: "1~2시간", transport: "노보텔에서 도보 10분", familyNote: "흥정 필수! 오전이 덜 붐비고 좋아요", lat: 16.0680, lng: 108.2241 },
    { emoji: "🍜", name: "Phở Bà Vị", category: "맛집", area: "다낭", description: "다낭 현지인 쌀국수 맛집", why: "진한 육수의 로컬 맛집", address: "684 Ngô Quyền, Da Nang", visitTime: "30분", transport: "택시/Grab", familyNote: "현지인이 줄서는 집. 아침식사로 추천", lat: 16.0597, lng: 108.2107 },
    { emoji: "🍜", name: "Bún chả cá Bà Hường", category: "맛집", area: "다낭", description: "다낭식 어묵국수", why: "다낭 대표 로컬 음식", address: "100 Lê Đình Dương, Da Nang", visitTime: "30분", transport: "노보텔에서 도보 15분", familyNote: "다낭 와서 이걸 안 먹으면 섭섭!", lat: 16.0650, lng: 108.2200 },
    { emoji: "🍖", name: "Madame Lân", category: "맛집", area: "다낭", description: "베트남 정통 레스토랑", why: "깔끔한 분위기의 베트남 요리", address: "4 Bạch Đằng, Da Nang", visitTime: "1시간", transport: "노보텔 바로 옆", familyNote: "한강뷰 레스토랑. 서여사 · 이서방 모시기 좋은 분위기", lat: 16.0675, lng: 108.2245 },
    { emoji: "☕", name: "43 Factory Coffee", category: "카페", area: "다낭", description: "다낭 최고 스페셜티 카페", why: "커피 맛집", address: "43 Trần Phú, Da Nang", visitTime: "1시간", transport: "한시장 근처 도보", familyNote: "코코넛 커피 강추. 에어컨 시원해서 쉬기 좋아요", lat: 16.0690, lng: 108.2230 },
    { emoji: "🏥", name: "호이안 종합병원", category: "병원", area: "호이안", description: "응급 시 이용 가능", why: "비상시 대비", address: "Hoi An General Hospital", visitTime: "비상시", transport: "택시/Grab", familyNote: "여행자 보험 가입 확인 필수", lat: 15.8835, lng: 108.3350 },
    { emoji: "🏥", name: "다낭 C병원", category: "병원", area: "다낭", description: "다낭 외국인 대응 병원", why: "비상시 대비", address: "Da Nang Hospital C", visitTime: "비상시", transport: "택시/Grab", familyNote: "외국인 환자 경험 많은 병원", lat: 16.0640, lng: 108.2170 },
    { emoji: "💱", name: "환전소", category: "환전", area: "호이안", description: "다낭/호이안 환전소", why: "현지 환전", address: "올드타운 주변 다수", visitTime: "10분", transport: "도보", familyNote: "금은방이 환율 좋은 편", lat: 15.8780, lng: 108.3290 },
    { emoji: "⛪", name: "다낭 대성당 (핑크성당)", category: "관광지", area: "다낭", description: "1923년 프랑스 식민시기 건설된 고딕 성당", why: "다낭 시내 대표 랜드마크", address: "156 Tran Phu, Hai Chau, Da Nang", visitTime: "30분", transport: "시내 중심, 한시장 도보 5분", familyNote: "포토 스팟! 외관 감상 위주, 내부는 미사 시간 외 제한", lat: 16.0670, lng: 108.2234 },
    { emoji: "🙏", name: "린응사 (선짜반도)", category: "관광지", area: "다낭", description: "67m 해수관음상, 선짜반도 명소", why: "다낭 상징적 뷰포인트", address: "Linh Ung Pagoda, Son Tra Peninsula", visitTime: "1~1.5시간", transport: "시내에서 택시/Grab 약 10km", familyNote: "아침 일찍 가면 시원하고 한적. 다낭 시내 전경 감상", lat: 16.1003, lng: 108.2779 },
    { emoji: "🪨", name: "오행산 (마블 마운틴)", category: "관광지", area: "다낭", description: "석회암 동굴과 사원, 다낭-호이안 중간", why: "독특한 풍경과 전망", address: "Marble Mountains, Ngu Hanh Son, Da Nang", visitTime: "1.5~2시간", transport: "다낭에서 남쪽 약 8km", familyNote: "엘리베이터 있어 올라가기 편함. 계단 구간은 경사 주의", lat: 15.9967, lng: 108.2630 },
    { emoji: "🛒", name: "롯데마트 다낭", category: "시장", area: "다낭", description: "에어컨 시원한 대형마트, 기념품 쇼핑", why: "커피/과자/연고 등 기념품 구매", address: "6 Nai Nam, Hai Chau, Da Nang", visitTime: "1~2시간", transport: "헬리오 야시장/다운타운 근처", familyNote: "시원하고 깔끔! 더운 낮에 2~3시간 구경하기 좋음", lat: 16.0395, lng: 108.2262 },
    { emoji: "🏬", name: "빈컴플라자 다낭", category: "시장", area: "다낭", description: "다낭 시내 대형 쇼핑몰 (9:30~22:00)", why: "쇼핑/식사/놀이 복합몰", address: "910A Ngo Quyen, Son Tra, Da Nang", visitTime: "2~3시간", transport: "시내 중심", familyNote: "4층 푸드코트, 아이스링크, 영화관. 한시장보다 깔끔하고 가격 합리적", lat: 16.0602, lng: 108.2105 },
    { emoji: "🦀", name: "선짜 야시장", category: "시장", area: "다낭", description: "해산물 중심 스트릿 야시장", why: "다낭 대표 야시장 체험", address: "Mai Hac De, Son Tra, Da Nang", visitTime: "1~2시간", transport: "시내에서 택시 10분", familyNote: "해산물 호객 주의. 활기찬 로컬 분위기 체험", lat: 16.0725, lng: 108.2285 },
  ],

  placeCategories: [
    { title: "호이안 맛집", emoji: "🍜", area: "호이안", items: [
      { name: "White Rose (화이트 로즈)", tip: "새우 쌀떡 만두, 부드러운 맛" },
      { name: "Cao Lau (까오 라우)", tip: "호이안에서만 먹을 수 있는 쫄깃 면" },
      { name: "Mi Quang (미꽝)", tip: "다낭 대표 면요리, 다양한 재료에 복잡한 맛" },
      { name: "4P's Pizza (포피스피자)", tip: "미소+연어사시미 피자! 베트남 핫 브랜드" },
    ]},
    { title: "다낭 맛집", emoji: "🍖", area: "다낭", items: [
      { name: "Phở Bà Vị", tip: "현지인 줄서는 쌀국수. 아침식사 추천" },
      { name: "Bún chả cá Bà Hường", tip: "다낭 대표 어묵국수, 꼭 먹어보기" },
      { name: "Madame Lân", tip: "한강뷰 레스토랑. 서여사 · 이서방 모시기 딱" },
    ]},
    { title: "카페", emoji: "☕", area: "all", items: [
      { name: "콩카페 (Cong Caphe)", tip: "코코넛 커피 추천. 다낭점은 한국인 90%" },
      { name: "하이랜드 커피 (Highlands)", tip: "베트남의 스타벅스. 한국인 적은 편" },
      { name: "43 Factory Coffee (다낭)", tip: "다낭 최고 스페셜티. 에어컨 시원" },
      { name: "코코넛 커피/스무디", tip: "어디서나 약 3~5만동" },
    ]},
    { title: "쇼핑", emoji: "🛍️", area: "all", items: [
      { name: "빈컴플라자", tip: "에어컨 시원! 4층 푸드코트, 기념품 깔끔하게" },
      { name: "롯데마트/고마트", tip: "커피, 망고칩, 연고 등 소모품 기념품" },
      { name: "한시장", tip: "1층 먹거리/건망고/커피, 2층 아오자이/라탄백. 흥정 필수" },
    ]},
    { title: "해변", emoji: "🏖️", area: "all", items: [
      { name: "미케 비치 (다낭)", tip: "숙소에서 가까우면 가볍게. 비치바 야경 추천" },
      { name: "안방 비치 (호이안)", tip: "호이안 근처, 조용하고 여유로움" },
    ]},
    { title: "액티비티", emoji: "🎯", area: "all", items: [
      { name: "코코넛 보트 (호이안)", tip: "방수팩 챙기기" },
      { name: "오행산 트레킹", tip: "엘리베이터 이용 가능. 동굴+전망 포인트" },
      { name: "선짜반도 드라이브", tip: "린응사+반코봉+원숭이. 날씨 맑은 날 추천" },
    ]},
  ],

  sos: {
    emergency: [
      { emoji: "🚑", label: "구급차 / 병원", sublabel: "115 바로 전화", number: "115" },
      { emoji: "🚔", label: "경찰", sublabel: "113 바로 전화", number: "113" },
    ],
    consulate: [
      { emoji: "🇰🇷", label: "영사콜센터 (24시간)", sublabel: "+82-2-3210-0404", number: "+82-2-3210-0404" },
    ],
    emergencySteps: [
      "안전한 곳으로 이동",
      "호텔 프론트에 연락 (가장 빠른 도움)",
      "위의 전화 버튼으로 연락",
      "가족 연락망으로 연락",
    ],
    hospitals: [
      { label: "호이안 종합병원", number: "+84-235-3861-364", note: "Hoi An General Hospital" },
      { label: "다낭 패밀리 메디컬", number: "+84-236-3582-700", note: "외국인 진료 가능" },
    ],
    koreanContacts: [
      { label: "다낭 한국총영사관", number: "+84-236-3556-225" },
      { label: "주베트남 한국대사관", number: "+84-24-3831-5110" },
    ],
    hotelAirline: [
      { label: "Little Oasis Hotel (호이안)", number: "+84-235-3939-939" },
      { label: "Novotel Danang (다낭)", number: "+84-236-3929-999" },
      { label: "대한항공 고객센터", number: "1588-2001" },
      { label: "대한항공 다낭", number: "+84-236-3583-398" },
    ],
    lostPassportSteps: [
      "가까운 경찰서에서 분실 신고서 발급",
      "다낭 한국총영사관 방문",
      "여행증명서(여권 대용) 발급",
      "여권 사본, 사진 2매 필요",
    ],
    hospitalVisitInfo: [
      "🛂 여권 원본",
      "📋 여행자 보험 증서",
      "💊 복용 중인 약 정보",
      "🩸 혈액형 정보",
      "📱 보험사 긴급 연락처",
    ],
  },

  exchange: {
    from: "krw", fromName: "한국 원", fromFlag: "🇰🇷", fromUnit: "원",
    to: "vnd", toName: "베트남 동", toFlag: "🇻🇳", toUnit: "동",
    fallbackRate: 18.5,
    localPrices: [
      { label: "쌀국수", amount: 40000 },
      { label: "반미", amount: 25000 },
      { label: "커피", amount: 35000 },
      { label: "맥주", amount: 15000 },
      { label: "마사지 1시간", amount: 200000 },
      { label: "Grab 택시", amount: 50000 },
      { label: "코코넛 보트", amount: 150000 },
      { label: "기념품", amount: 100000 },
    ],
    tip: {
      main: "베트남 동에서 0 하나 빼고 2로 나누면 대략 한국 원!",
      example: "예: 50,000동 → 0 빼면 5,000 → ÷2 = 약 2,500원",
    },
  },

  weather: {
    locations: [
      { lat: 16.0544, lon: 108.2022, city: "다낭" },
      { lat: 15.8801, lon: 108.338, city: "호이안" },
    ],
    defaultIndex: 0,
  },
};
