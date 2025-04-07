export type CompanyUploadSchema = {
    companyCode: string,
    companyDescription: string,
    businessSegment: string,
    event: string,
    error?: string,
    status?: boolean
}

export type CourseUploadSchema = {
    courseCode: string,
    courseDescription: string,
    numberClass: number,
    averageDuration: number,
    event: string,
    error?: string,
    status?: boolean
}

export type GoalUploadSchema = {
    goalCode: string,
    producerCode: string,
    indicatorCode: string,
    goalYear: string,
    goal: string,
    event: string,
    error?: string,
    status?: boolean
}

export type IndicatorCourseUploadSchema = {
    indicatorCode: string,
    courseCode: string,
    event: string,
    error?: string,
    status?: boolean
}

export type IndicatorUploadSchema = {
    indicatorCode: string,
    indicatorDescription: string,
    companyCode: string,
    event: string,
    error?: string,
    status?: boolean
}

export type ProducerUploadSchema = {
    producerCode: string,
    producerDescription: string,
    cityName: string,
    uf: string,
    companyCode: string,
    event: string,
    error?: string,
    status?: boolean
}

export type ValueIndicatorUploadSchema = {
    producerCode: string,
    indicatorCode: string,
    indicatorValue: string,
    summaryGrouper: string,
    event: string,
    error?: string,
    status?: boolean
}

export type WorkerCourseUploadSchema = {
    cpf: string,
    courseCode: string,
    registrationDate?: string,
    lastAccessDate?: string,
    completionDate?: string,
    cityName: string,
    uf: string,
    event: string,
    error?: string,
    status?: boolean
}
