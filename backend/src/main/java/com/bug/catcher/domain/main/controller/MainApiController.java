package com.bug.catcher.domain.main.controller;

import com.bug.catcher.domain.hunter.repository.HunterRepository;
import com.bug.catcher.domain.request.repository.RequestRepository;
import com.bug.catcher.domain.review.repository.ReviewRepository;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/main")
@RequiredArgsConstructor
public class MainApiController {

    private final RequestRepository requestRepository;
    private final HunterRepository hunterRepository;
    private final ReviewRepository reviewRepository;

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        long totalRequests = requestRepository.count();
        long activeHunters = hunterRepository.count();
        double averageRating = Math.round(reviewRepository.getGlobalAverageRating() * 10.0) / 10.0;

        return Map.of(
                "totalRequests", totalRequests,
                "activeHunters", activeHunters,
                "averageRating", averageRating
        );
    }
}
