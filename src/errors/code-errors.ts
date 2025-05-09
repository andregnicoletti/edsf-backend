
export const CodeErrorConstant = {
    ERROR_VALIDADE_INPUT_DATA: 'EDSF-001',
    ERROR_VALIDATE_FIELD: 'EDSF-0002',
    ERROR_FILE_TOO_LARGE: 'EDSF-0003',
}

export const ProducerServiceErrors = {
    ERROR_FIND_PRODUCER_BY_ID: 'PRSE-001',
    ERROR_PRODUCER_CODE_IS_REQUIRED: 'PRSE-002',
    ERROR_PRODUCER_DESCRIPTION_IS_REQUIRED: 'PRSE-003',
    ERROR_PRODUCER_CODE_SIZE: 'PRSE-004',
    ERROR_PRODUCER_DESCRIPTION_SIZE: 'PRSE-005',
    ERROR_PRODUCER_CODE_ALREADY_EXISTS: 'PRSE-006',
    ERROR_PRODUCER_ID_DOES_NOT_EXISTS: 'PRSE-007',
    ERROR_PRODUCER_CODE_EMPTY: 'PRSE-008',
    ERROR_COMPANY_CODE_IS_REQUIRED: 'PRSE-009',
    ERROR_COMPANY_CODE_EMPTY: 'PRSE-010',
}

export const CityServiceErrors = {
    ERROR_FIND_CITY_BY_NAME_AND_UF: 'CISE-001',
    ERROR_CITY_NAME_IS_REQUIRED: 'CISE-002',
    ERROR_UF_IS_REQUIRED: 'CISE-003',
    ERROR_UF_SIZE: 'CISE-004',
    ERROR_FIND_CITY_BY_ID: 'CISE-005',
}

export const CompanyServiceErrors = {
    ERROR_COMPANY_CODE_DOESNT_EXISTIS: 'CPSE-001',
    ERROR_COMPANY_CODE_ALREADY_EXISTS: 'CPSE-002',
    ERROR_COMPANY_CODE_IS_REQUIRED: 'CPSE-003',
    ERROR_COMPANY_DESCRIPTION_IS_REQUIRED: 'CPSE-004',
    ERROR_BUSINESS_SEGMENT_IS_REQUIRED: 'CPSE-005',
    ERROR_COMPANY_ID_DOES_NOT_EXIST: 'CPSE-006',
}

export const CourseServiceErrors = {
    ERROR_FIND_COURSE_BY_ID: 'COSE-001',
    ERROR_COURSE_CODE_ALREADY_EXISTS: 'COSE-002',
    ERROR_FIELD_IS_REQUIRED: 'COSE-003',
}

export const WorkerServiceError = {
    ERROR_INVALID_DATES: 'WKSE-001',
    ERROR_FIELD_IS_REQUIRED: 'WKSE-002',
    ERROR_ID_NOT_FOUND: 'WKSE-003',
}

export const UploadServiceError = {
    ERROR_EVENT_MUST_BE_PROVIDED: 'UPSE-001',
    ERROR_EVENT_NAME_IS_INCORRECT: 'UPSE-002',
    ERROR_FILE_EXTENSION_IS_NOT_ACCEPTED: 'UPSE-003',
    ERROR_THE_FILE_IS_NOT_VALID: 'UPSE-004',
    ERROR_PROCESSING_CSV_FILE: 'UPSE-005',
    ERROR_INVALID_LAYOUT: 'UPSE-006',
    ERROR_FILE_IS_EMPTY: 'UPSE-007',
    ERROR_FILE_TOO_LARGE: 'UPSE-008',
}

export const DownloadServiceError = {
    ERROR_CSV_TEMPLATE_NOT_FOUND: 'DWSE-001',
    ERROR_CSV_TEMPLATE_IS_RESTICTED: 'DWSE-002',
}

export const IndicatorServiceErrors = {
    ERROR_INDICATOR_CODE_DOESNT_EXISTIS: 'INSE-001',
    ERROR_INDICATOR_CODE_ALREADY_EXISTS: 'INSE-002',
    ERROR_FIELD_IS_REQUIRED: 'INSE-003',
    ERROR_TO_SAVE_INDICATOR_COURSE_ASSOC: 'INSE-004',
    ERROR_INDICATOR_ID_NOT_FOUND: 'INSE-005',
    ERROR_FIELD_SUMMARY_YEAR_IS_INVALID: 'INSE-006',
}

export const GoalIndicatorServiceErrors = {
    ERROR_GOAL_CODE_DOESNT_EXISTIS: 'GISE-001',
    ERROR_GOAL_CODE_ALREADY_EXISTS: 'GISE-002',
    ERROR_FIELD_IS_REQUIRED: 'GISE-003',
    ERROR_GOAL_CODE_SIZE: 'GISE-004',
    ERROR_INVALID_FIELD: 'GISE-005',
}

export const UserServiceErrors = {
    ERROR_USER_NOT_FOUND: 'USSE-001',
    ERROR_USER_ID_IS_REQUIRED: 'USSE-002',
    ERROR_USER_EMAIL_ALREADY_EXISTS: 'USSE-003'
}

export const AuthenticateServiceErrors = {
    ERROR_INVALID_CREDENTIALS: 'AUSE-001',
    ERROR_LOGOUT: 'AUSE-002',
    ERROR_INVALID_TOKEN: 'AUSE-003',
}

export const PanelServiceErrors = {
    ERROR_FIND_PANEL_BY_ID: 'PNSE-001',
    ERROR_INVALID_PANEL_TYPE: 'PNSE-002',
    ERROR_INVALID_PANEL_NAME: 'PNSE-003',
    ERROR_INVALID_PANEL_CONFIGURATION: 'PNSE-004',
    ERROR_INVALID_PANEL_CONFIGURATION_JSON: 'PNSE-005',
}