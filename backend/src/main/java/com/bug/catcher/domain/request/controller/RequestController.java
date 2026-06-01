package com.bug.catcher.domain.request.controller;

import com.bug.catcher.domain.request.dto.RequestDetailResponseDto;
import com.bug.catcher.domain.request.dto.RequestEditFormDto;
import com.bug.catcher.domain.request.dto.RequestFormDto;
import com.bug.catcher.domain.request.dto.RequestMediaFileUrlDto;
import com.bug.catcher.domain.request.service.RequestService;
import com.bug.catcher.global.auth.CustomUserPrincipal;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/request")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;

    @PreAuthorize("hasRole('USER')")
    @PostMapping(value = "/new", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<Map<String, Object>> createRequest(
            @AuthenticationPrincipal CustomUserPrincipal loginUser,
            @ModelAttribute RequestFormDto form,
            HttpServletRequest request) {
        validateSingleVideoFile(request);
        requestService.createRequest(loginUser.getUserId(), form);
        return requestService.readRequestList();
    }

    @GetMapping("/wholeList")
    public Page<Map<String, Object>> readRequestList(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "latest") String sortType,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Sort sort = "viewCount".equals(sortType)
                ? Sort.by(Sort.Direction.DESC, "viewCount")
                : Sort.by(Sort.Direction.DESC, "createdAt");

        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                sort
        );
        return requestService.readRequestPage(status, sortedPageable);
    }

    @GetMapping(value = "/detail/{id}")
    public RequestDetailResponseDto requestDetail(@PathVariable Long id) {
        return requestService.readRequestDetail(id);
    }

    @PreAuthorize("hasRole('USER') and @requestPermissionChecker.isOwner(#requestId, principal.userId)")
    @GetMapping(value = "/edit/{requestId}")
    public RequestEditFormDto editForm(@PathVariable Long requestId) {
        return requestService.getEditForm(requestId);
    }

    @PreAuthorize("hasRole('USER') and @requestPermissionChecker.isOwner(#requestId, principal.userId)")
    @PatchMapping(value = "/edit/{requestId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public RequestDetailResponseDto updateRequest(
            @AuthenticationPrincipal CustomUserPrincipal loginUser,
            @PathVariable Long requestId,
            @ModelAttribute RequestFormDto form,
            @ModelAttribute RequestMediaFileUrlDto mediaUrlDto,
            HttpServletRequest request) {

        validateSingleVideoFile(request);
        requestService.updateRequest(requestId, loginUser.getUserId(), form, mediaUrlDto);
        return requestService.readRequestDetail(requestId);
    }

    @PreAuthorize("hasRole('USER') and @requestPermissionChecker.isOwner(#requestId, principal.userId)")
    @DeleteMapping(value = "/remove/{requestId}")
    public List<Map<String, Object>> deleteRequestList(
            @PathVariable Long requestId) {
        requestService.deleteRequest(requestId);
        return requestService.readRequestList();
    }

    private void validateSingleVideoFile(HttpServletRequest request) {
        try {
            long videoFileCount = request.getParts()
                    .stream()
                    .filter(part -> "videoFile".equals(part.getName()))
                    .filter(part -> part.getSize() > 0)
                    .count();

            if (videoFileCount > 1) {
                throw new IllegalArgumentException("동영상은 1개만 첨부할 수 있습니다.");
            }
        } catch (IOException | ServletException e) {
            throw new IllegalArgumentException("첨부 파일을 확인할 수 없습니다.", e);
        }
    }
}
