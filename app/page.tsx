import Link from "next/link";

const painPoints = [
  {
    emoji: "😮‍💨",
    title: "주담대 이자만 매달 70만원...",
    desc: "원금은 줄지도 않는데 이자는 꼬박꼬박 나가고 있어요.",
  },
  {
    emoji: "😤",
    title: "특판 있었는데 나중에 알았어요",
    desc: "지인이 알려줬는데 이미 종료된 뒤였어요. 허탈했습니다.",
  },
  {
    emoji: "🤯",
    title: "은행 8개를 매일 확인할 수가 없어요",
    desc: "직장 다니면서 매일 은행 홈페이지 뒤지는 건 무리예요.",
  },
  {
    emoji: "💸",
    title: "중도상환수수료가 걱정돼서 못 갈아타요",
    desc: "갈아타면 이득인지 손해인지 직접 계산하기가 너무 복잡해요.",
  },
];

const features = [
  {
    step: "01",
    title: "내 조건 3분 입력",
    desc: "대출 잔액, 현재 금리, 은행만 입력하면 끝. 복잡한 서류 없이 간단하게.",
    color: "bg-blue-50 border-blue-200",
    iconBg: "bg-blue-100",
    icon: "📋",
  },
  {
    step: "02",
    title: "특판 나오면 즉시 알림",
    desc: "8개 은행 특판을 모니터링해서 내 조건에 맞는 특판이 나오면 바로 알려드려요.",
    color: "bg-green-50 border-green-200",
    iconBg: "bg-green-100",
    icon: "🔔",
  },
  {
    step: "03",
    title: "이득 자동 계산",
    desc: "중도상환수수료까지 고려해서 실제로 얼마나 아끼는지 자동으로 계산해드려요.",
    color: "bg-blue-50 border-blue-200",
    iconBg: "bg-blue-100",
    icon: "🧮",
  },
  {
    step: "04",
    title: "8개 은행 모니터링",
    desc: "KB, 신한, 우리, 하나, NH농협, 카카오뱅크, 토스뱅크, K뱅크 전부 커버.",
    color: "bg-green-50 border-green-200",
    iconBg: "bg-green-100",
    icon: "🏦",
  },
];

const faqs = [
  {
    q: "실제로 대출을 갈아타는 것까지 도와주나요?",
    a: "아니요. 저희는 특판 정보 알림과 이자 절감 계산만 제공합니다. 실제 대출 이동은 해당 은행에 직접 신청하시면 됩니다.",
  },
  {
    q: "무료 플랜과 프리미엄 플랜의 차이가 뭔가요?",
    a: "무료 플랜은 대시보드에서 특판을 직접 확인하는 방식이고, 프리미엄 플랜은 새 특판이 등록되면 이메일·카카오톡으로 즉시 알림을 받을 수 있습니다.",
  },
  {
    q: "개인정보(대출 정보)는 안전한가요?",
    a: "입력하신 대출 정보는 암호화되어 안전하게 보관되며, 제3자에게 제공되지 않습니다.",
  },
  {
    q: "언제든지 해지할 수 있나요?",
    a: "네, 언제든지 구독을 해지할 수 있으며 다음 결제일부터 청구되지 않습니다.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* 네비게이션 */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="font-bold text-xl text-blue-700">이자세이버</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/signup"
              className="text-sm text-slate-600 hover:text-blue-700 font-medium px-3 py-1.5"
            >
              로그인
            </Link>
            <Link
              href="/onboarding"
              className="text-sm bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              무료 시작
            </Link>
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <span>✨</span>
            <span>8개 은행 특판 실시간 모니터링</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
            매달 10만원씩<br />
            <span className="text-blue-600">이자 더 내고 계신가요?</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-4 max-w-2xl mx-auto">
            주담대 특판을 놓치지 마세요.<br />
            <strong className="text-green-600">월 4,900원</strong>으로 연 100만원 이상 아끼세요.
          </p>

          {/* 절감 강조 배너 */}
          <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-6 py-4 mb-10">
            <span className="text-3xl">💵</span>
            <div className="text-left">
              <div className="text-sm text-green-700 font-medium">2억원 대출 기준</div>
              <div className="text-2xl font-black text-green-600">연 139만원 절감 가능</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto bg-blue-600 text-white font-bold text-lg px-10 py-4 rounded-xl hover:bg-blue-700 transition-all hover:scale-105 shadow-lg shadow-blue-200"
            >
              무료로 시작하기 →
            </Link>
            <p className="text-sm text-slate-500">신용카드 불필요 · 30초 가입</p>
          </div>
        </div>
      </section>

      {/* 문제 공감 섹션 */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              주담대 대출자라면<br />
              <span className="text-red-500">이런 경험 있지 않으신가요?</span>
            </h2>
            <p className="text-slate-500 text-lg">많은 분들이 이런 상황에 처해있습니다</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {painPoints.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex gap-4 items-start"
              >
                <span className="text-3xl flex-shrink-0">{item.emoji}</span>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 솔루션 섹션 */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              이자세이버가<br />
              <span className="text-blue-600">이 모든 걸 해결해드려요</span>
            </h2>
            <p className="text-slate-500 text-lg">복잡한 것 없이, 딱 필요한 것만</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 border ${f.color} flex gap-4 items-start`}
              >
                <div className={`${f.iconBg} rounded-xl p-3 flex-shrink-0`}>
                  <span className="text-2xl">{f.icon}</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-1">STEP {f.step}</div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 실제 절감 케이스 섹션 */}
      <section className="py-20 px-4 sm:px-6 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            실제 절감 사례
          </h2>
          <p className="text-blue-200 text-lg mb-12">이자세이버를 통해 특판 정보를 받은 실제 케이스입니다</p>

          <div className="bg-white rounded-3xl p-8 sm:p-10 text-left shadow-2xl max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                👨‍💼
              </div>
              <div>
                <div className="font-bold text-slate-900">김대리님 케이스</div>
                <div className="text-sm text-slate-500">경기도 / 아파트담보대출 / 하나은행</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-sm text-slate-500 mb-1">대출 잔액</div>
                <div className="text-xl font-black text-slate-900">2억원</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-sm text-slate-500 mb-1">기존 금리</div>
                <div className="text-xl font-black text-slate-900">4.5%</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-sm text-green-700 mb-1">특판 금리</div>
                <div className="text-xl font-black text-green-600">3.8%</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-sm text-green-700 mb-1">연간 절감액</div>
                <div className="text-xl font-black text-green-600">139만원</div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-800 font-medium text-sm">
                "이자세이버 알림 덕분에 특판 이틀 만에 신청했어요.<br />
                이자 연 139만원이 절약됩니다. 구독료 100배 이상 효과네요!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 가격 섹션 */}
      <section id="pricing" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              합리적인 가격
            </h2>
            <p className="text-slate-500 text-lg">커피 한 잔 값으로 연 100만원을 아끼세요</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* 무료 플랜 */}
            <div className="rounded-2xl border-2 border-slate-200 p-8">
              <div className="font-bold text-slate-500 text-sm mb-3">FREE</div>
              <div className="text-4xl font-black text-slate-900 mb-1">무료</div>
              <div className="text-slate-400 text-sm mb-8">영원히 무료</div>
              <ul className="space-y-3 mb-8">
                {[
                  "대시보드에서 특판 확인",
                  "이자 절감 계산기",
                  "대출 정보 저장 1개",
                  "주 1회 특판 업데이트",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-green-500 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                무료로 시작하기
              </Link>
            </div>

            {/* 프리미엄 플랜 */}
            <div className="rounded-2xl border-2 border-blue-500 p-8 relative bg-blue-600 text-white shadow-2xl shadow-blue-200">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-400 text-green-900 text-xs font-bold px-4 py-1 rounded-full">
                첫 달 무료
              </div>
              <div className="font-bold text-blue-200 text-sm mb-3">PREMIUM</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black">4,900원</span>
                <span className="text-blue-300 mb-1">/월</span>
              </div>
              <div className="text-blue-300 text-sm mb-8">첫 달 무료 · 언제든 해지</div>
              <ul className="space-y-3 mb-8">
                {[
                  "무료 플랜의 모든 기능",
                  "실시간 이메일 알림",
                  "카카오톡 즉시 알림",
                  "8개 은행 실시간 업데이트",
                  "중도상환 수수료 계산",
                  "우선 고객 지원",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white">
                    <span className="text-green-300 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center py-3 rounded-xl bg-white text-blue-600 font-bold hover:bg-blue-50 transition-colors"
              >
                첫 달 무료로 시작하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ 섹션 */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">자주 묻는 질문</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2 flex items-start gap-2">
                  <span className="text-blue-500 flex-shrink-0">Q.</span>
                  {faq.q}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 최하단 CTA 섹션 */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            지금 시작하면<br />다음 특판을 놓치지 않아요
          </h2>
          <p className="text-blue-200 text-lg mb-10">
            무료로 시작해서 첫 특판 알림을 받아보세요.
          </p>
          <Link
            href="/onboarding"
            className="inline-block bg-white text-blue-700 font-bold text-lg px-10 py-4 rounded-xl hover:bg-blue-50 transition-all hover:scale-105 shadow-xl"
          >
            무료로 시작하기 →
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <span className="font-bold text-white">이자세이버</span>
          </div>
          <p className="text-sm">© 2026 이자세이버. All rights reserved.</p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-white transition-colors">이용약관</a>
            <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
