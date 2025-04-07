export type DashboardStackedColumnChart = {
    filters: {
        sort: string,
        total: number,
        courses: string[],
        states: string[],
        cities: string[],
        indicators: string[],
        yearFrom: string,
        monthFrom: string,
        yearTo: string,
        monthTo: string,
    }
}