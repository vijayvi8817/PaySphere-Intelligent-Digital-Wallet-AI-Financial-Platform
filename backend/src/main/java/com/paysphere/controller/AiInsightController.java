package com.paysphere.controller;

import com.paysphere.dto.response.ApiResponse;
import com.paysphere.dto.response.AiAdvisorResponse;
import com.paysphere.security.CustomUserDetails;
import com.paysphere.service.AiInsightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiInsightController {

    private final AiInsightService aiInsightService;

    @GetMapping("/advisor")
    public ResponseEntity<ApiResponse<AiAdvisorResponse>> getAdvisorSummary(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        AiAdvisorResponse summary = aiInsightService.getAiAdvisorSummary(currentUser.getId().toString());
        return ResponseEntity.ok(ApiResponse.success("AI Advisor summary generated", summary));
    }

    @PostMapping("/ask")
    public ResponseEntity<ApiResponse<AiAdvisorResponse>> askAi(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestBody Map<String, String> body) {
        String prompt = body.getOrDefault("prompt", "How can I improve my savings rate?");
        AiAdvisorResponse response = aiInsightService.askAiQuestion(currentUser.getId().toString(), prompt);
        return ResponseEntity.ok(ApiResponse.success("AI Advisor response generated", response));
    }
}
