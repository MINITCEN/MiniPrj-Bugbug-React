
/*
 * ============================================================================
 *  [DEPRECATED] MyPageViewController
 * ============================================================================
 *
 *  이 컨트롤러는 Thymeleaf 기반 마이페이지를 React SPA로 전환하면서
 *  비활성화되었습니다.
 *
 *  ▶ 비활성화 사유
 *    - 새 마이페이지는 React Router(`/mypage/**`)로 라우팅되며,
 *      백엔드에서는 `SpaController`가 `/mypage/**` → `index.html`로
 *      forward 합니다.
 *    - 본 컨트롤러가 살아있으면 `@Controller`의 구체 매핑이
 *      SpaController의 와일드카드 매핑보다 우선 매칭되어 React가
 *      절대 화면에 뜨지 않습니다. (충돌 방지)
 *
 *  ▶ 기존 Thymeleaf 화면이 사용하던 데이터는
 *    `MyPageController(@RestController, /api/mypage/**)`에서
 *    JSON으로 그대로 제공됩니다. View 전용 로직은 없으므로
 *    삭제해도 무방하지만, 전환 이력 보존을 위해 주석으로 남깁니다.
 *
 *  ▶ 안전하게 제거 가능한 시점
 *    - React 마이페이지가 운영에 안정적으로 배포되고
 *      `src/main/resources/templates/{dashboard, request-list,
 *      review-list, bookmark-list, hunter-task-list,
 *      hunter-bookmark-list}.html` 도 함께 정리되는 PR에서
 *      이 파일과 위 템플릿 6개를 함께 삭제하세요.
 *
 *  ▶ 관련
 *    - SpaController: /global/config/SpaController.java
 *    - REST API:      /domain/mypage/controller/MyPageController.java
 * ============================================================================
 */
// package com.bug.catcher.domain.mypage.controller;

// import com.bug.catcher.domain.entity.User;
// import com.bug.catcher.domain.mypage.service.MyPageService;
// import com.bug.catcher.global.auth.CustomUserPrincipal;
// import lombok.RequiredArgsConstructor;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.security.core.annotation.AuthenticationPrincipal;
// import org.springframework.stereotype.Controller;
// import org.springframework.ui.Model;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RequestMapping;

// @Controller
// @RequestMapping("/mypage")
// @RequiredArgsConstructor
// public class MyPageViewController {

//     private final MyPageService myPageService;

//     @PreAuthorize("hasAnyRole('USER', 'HUNTER')")
//     @GetMapping
//     public String myPage() {
//         return "redirect:/mypage/dashboard";
//     }

//     @PreAuthorize("hasAnyRole('USER', 'HUNTER')")
//     @GetMapping("/dashboard")
//     public String dashboardView(
//             @AuthenticationPrincipal CustomUserPrincipal loginUser,
//             Model model) {

//         User currentUser = myPageService.getDashboardUser(loginUser.getUserId());

//         model.addAttribute("user", currentUser);
//         model.addAttribute("isHunter", "HUNTER".equals(currentUser.getRole()));
//         return "dashboard";
//     }

//     @PreAuthorize("hasRole('USER')")
//     @GetMapping("/requests")
//     public String requestListView() {
//         return "request-list";
//     }

//     @PreAuthorize("hasAnyRole('USER', 'HUNTER')")
//     @GetMapping("/reviews")
//     public String reviewListView() {
//         return "review-list";
//     }

//     @PreAuthorize("hasRole('USER')")
//     @GetMapping("/bookmarks/hunters")
//     public String bookmarkListView() {
//         return "bookmark-list";
//     }

//     @PreAuthorize("hasRole('HUNTER')")
//     @GetMapping("/hunter/tasks")
//     public String hunterTaskListView() {
//         return "hunter-task-list";
//     }

//     @PreAuthorize("hasRole('HUNTER')")
//     @GetMapping("/hunter/bookmarks/requests")
//     public String hunterBookmarkListView() {
//         return "hunter-bookmark-list";
//     }
// }
