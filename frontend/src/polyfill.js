/**
 * Vite 환경 호환성 폴리필 (Polyfill)
 * 
 * sockjs-client와 같이 조금 오래된 라이브러리들은 내부적으로 Node.js 환경의 'global' 전역 변수를 참조합니다.
 * 최신 ESM 표준 및 최적화를 준수하는 Vite 환경에서는 자동으로 'global' 변수를 주입하지 않기 때문에,
 * 브라우저에서 'Uncaught ReferenceError: global is not defined' 에러가 발생하며 화면이 멈추게 됩니다.
 * 
 * 이 파일은 앱이 마운트되기 전 브라우저 전역 객체인 'window'를 'global'로 맵핑하여 
 * sockjs-client가 에러 없이 정상 구동되도록 호환성을 제공합니다.
 */
if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  window.global = window;
}
