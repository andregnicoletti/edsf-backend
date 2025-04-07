import { ProducerPanel } from "./dashboard-producer-panel";

export type ResultPanel = {
    cityId: string,
    city: string,
    state: string,
    producers: ProducerPanel[],
}