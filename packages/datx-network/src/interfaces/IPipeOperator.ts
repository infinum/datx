import { NetworkPipeline } from '../NetworkPipeline';

export type IPipeOperator = (request: NetworkPipeline) => void;
