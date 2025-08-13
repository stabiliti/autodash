


export enum AppState {
  UPLOAD,
  LOADING,
  HEALTH_CHECK,
  DASHBOARD,
  ERROR,
}

export enum ColumnType {
  NUMERIC = 'Numeric',
  CATEGORICAL = 'Categorical',
  DATE = 'Date',
  UNKNOWN = 'Unknown',
}

export interface ColumnStats {
  mean?: number;
  median?: number;
  stdDev?: number;
  min?: number;
  max?: number;
  uniqueValues?: number;
  topValues?: { value: string; count: number }[];
  minDate?: string;
  maxDate?: string;
}

export interface ColumnSummary {
  columnName: string;
  inferredType: ColumnType;
  missingValues: number;
  totalRows: number;
  stats: ColumnStats;
}

export interface CsvGlobalStats {
  totalRows: number;
  totalCols: number;
  emptyCells: number;
}

export type CsvData = Record<string, string | number>[];

export type AggregationType = 'SUM' | 'AVERAGE' | 'COUNT' | 'COUNT_DISTINCT';

export interface KpiWidgetConfig {
  type: 'kpi_card';
  title: string;
  description: string;
  valueColumn: string;
  aggregation: AggregationType;
}

export type RechartsChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'area';

export interface ChartWidgetConfig {
  type: 'chart';
  title: string;
  description: string;
  chartType: RechartsChartType;
  xAxisKey: string;
  yAxisKeys: string[];
}

export interface AiNarrativeWidgetConfig {
  type: 'ai_narrative';
  content: string;
}

export interface DashboardSchema {
  header: {
    ai_narrative: AiNarrativeWidgetConfig;
    kpis: KpiWidgetConfig[];
  };
  body: ChartWidgetConfig[];
}

export interface QaAnswer {
  text?: string;
  chart?: ChartWidgetConfig & { data?: CsvData };
}

export interface QaItem {
  id: string;
  question: string;
  answer: QaAnswer;
  isStreaming?: boolean;
}

export interface SavedDashboardState {
  schema: DashboardSchema;
  data: CsvData;
  fileName: string;
  qaHistory: QaItem[];
  csvGlobalStats: CsvGlobalStats;
  csvSummary: ColumnSummary[];
}

export type SavedDashboards = Record<string, SavedDashboardState>;