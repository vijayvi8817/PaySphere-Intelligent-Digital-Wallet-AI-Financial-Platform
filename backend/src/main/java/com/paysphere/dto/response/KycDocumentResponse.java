package com.paysphere.dto.response;

import com.paysphere.enums.DocumentType;
import com.paysphere.enums.KycStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycDocumentResponse {
    private String id;
    private String userId;
    private String userEmail;
    private String userName;
    private DocumentType documentType;
    private String documentNumber;
    private String idFrontUrl;
    private String idBackUrl;
    private String selfieUrl;
    private KycStatus status;
    private String rejectionReason;
    private String reviewedBy;
    private Instant reviewedAt;
    private Instant createdAt;
}
