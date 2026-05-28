export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* 브랜드 */}
        <a href="/" className="flex items-center gap-2">
          <img src="/image/favicon.svg" alt="버그버그 로고" className="w-7 h-7 rounded-lg" />
          <span className="font-bold text-white">버그버그</span>
        </a>

        {/* 링크 */}
        <nav className="flex items-center gap-5 text-sm">
          <a href="/terms" className="hover:text-white transition-colors">이용약관</a>
          <a href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</a>
          <a href="/support" className="hover:text-white transition-colors">고객센터</a>
        </nav>

        {/* 카피라이트 */}
        <p className="text-xs text-gray-500">© 2024 버그버그. All rights reserved.</p>
      </div>
    </footer>
  )
}
