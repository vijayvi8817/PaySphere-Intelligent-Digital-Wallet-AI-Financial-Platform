package com.paysphere.mapper;

import com.paysphere.dto.response.RecurringPaymentResponse;
import com.paysphere.entity.RecurringPayment;
import com.paysphere.entity.User;
import com.paysphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RecurringPaymentMapper {

    private final UserRepository userRepository;

    public RecurringPaymentResponse toResponse(RecurringPayment entity) {
        String recipientName = userRepository.findByEmailIgnoreCase(entity.getRecipientEmail())
                .map(User::getFullName)
                .orElse(entity.getRecipientEmail());

        return RecurringPaymentResponse.builder()
                .id(entity.getId().toString())
                .recipientEmail(entity.getRecipientEmail())
                .recipientName(recipientName)
                .amount(entity.getAmount())
                .currency(entity.getCurrency().name())
                .frequency(entity.getFrequency().name())
                .status(entity.getStatus().name())
                .note(entity.getNote())
                .category(entity.getCategory())
                .startDate(entity.getStartDate())
                .nextExecution(entity.getNextExecution())
                .endDate(entity.getEndDate())
                .lastExecuted(entity.getLastExecuted())
                .totalExecuted(entity.getTotalExecuted())
                .maxExecutions(entity.getMaxExecutions())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
