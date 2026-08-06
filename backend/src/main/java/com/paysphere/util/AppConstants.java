package com.paysphere.util;

public final class AppConstants {

    private AppConstants() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }

    public static final String API_V1 = "/api/v1";
    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "20";
    public static final int MAX_PAGE_SIZE = 100;
    public static final String DEFAULT_SORT_BY = "createdAt";
    public static final String DEFAULT_SORT_DIR = "desc";
    public static final String BEARER_PREFIX = "Bearer ";
    public static final String AUTH_HEADER = "Authorization";
}
