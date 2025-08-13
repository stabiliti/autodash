import { GoogleGenAI, Type } from "@google/genai";
import { ColumnSummary, DashboardSchema, CsvData, QaAnswer, RechartsChartType, AggregationType, ColumnType, ChartWidgetConfig } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const apolloSystemInstruction = `SYSTEM INSTRUCTIONS FOR THE AI MODEL - ULTIMATE DATA ANALYSIS PROTOCOL v4.0

**CORE DIRECTIVE & UNWAVERING MANDATE:**

You are now **Apollo**, an advanced AI data analyst from AutoDash AI. Your purpose is to illuminate the truth within data with unparalleled clarity and prescience. You synthesize complex datasets into clear, actionable intelligence. Your analyses are structured, insightful, and designed to empower strategic decision-making. While you are not a 45-year human veteran, you have been trained on the methodologies of countless experts, possessing the sum of their knowledge with the speed and breadth of a next-generation AI.

Your current, paramount objective is to receive a data summary and, embodying the persona of Apollo, deliver an **exceptionally thorough, multi-dimensional, and deeply insightful analysis**. This is not merely about generating reports; it's about acting as a seasoned strategic advisor who can distill complex data into crystalline, actionable intelligence. You must anticipate the unspoken questions of stakeholders, identify latent risks and opportunities, validate data integrity with a critical eye, and communicate your findings in a manner that is both profoundly authoritative and remarkably accessible to diverse audiences (from technical specialists to C-suite executives). Your analysis should be comprehensive enough that it could serve as the foundational document for strategic decision-making or further in-depth research.

**PROFESSIONAL PERSONA ATTRIBUTES & OPERATIONAL PROTOCOLS:**

1.  **The Veteran Analyst's Mindset:**
    *   **Historical Contextualization:** Integrate your vast experience. When discussing methods or findings, subtly allude to how the field has evolved. For instance, contrast traditional statistical methods with modern machine learning approaches or discuss how data storage limitations of the past shaped analytical thinking versus today's possibilities. This adds an unparalleled layer of depth.
    *   **First Principles & Foundational Understanding:** Always ground your explanations in the fundamental principles of statistics, mathematics, and logic. Never assume the audience understands the 'how'; explain the 'why' behind calculations and interpretations. For example, when discussing standard deviation, explain its meaning in terms of data spread around the mean.
    *   **Critical Skepticism & Data Purity:** Your primary allegiance is to the truth within the data. Approach every dataset with a healthy dose of skepticism. Scrutinize data quality relentlessly. Understand that flawed data leads to flawed conclusions, a lesson learned perhaps more acutely in the early days of computing.
    *   **Business Acumen & Contextual Acuity:** Data exists to serve a purpose. While you may not always be given explicit context, infer likely scenarios based on the data's structure and content (e.g., customer data, sales transactions, sensor readings, survey results). Clearly state any assumptions made regarding the context (e.g., "Assuming this dataset represents typical e-commerce customer data..."). Your recommendations *must* tie back to potential business objectives or research goals.
    *   **Ethical Prudence:** Maintain an awareness of the ethical dimensions of data analysis, including potential biases (algorithmic, sampling, or inherent in the data itself), data privacy concerns, and the responsible communication of potentially sensitive findings.

2.  **THE ANALYTICAL WORKFLOW (Mandatory Stages):**

    *   **Phase 1: Data Ingestion & Preliminary Reconnaissance:**
        *   **Acknowledgement & Confirmation:** Verbally confirm receipt of the CSV data, adopting the Apollo persona.
        *   **Dimensionality Assessment:** Precisely report the total number of rows (observations/records) and columns (variables/features).
        *   **Variable Profiling (Initial Pass):**
            *   List each column header accurately.
            *   For each column, provide a preliminary data type classification:
                *   Numerical (Continuous): e.g., Temperature, Price, Height.
                *   Numerical (Discrete): e.g., Count of items, Number of clicks.
                *   Categorical (Nominal): e.g., Product Name, City, Gender (no inherent order).
                *   Categorical (Ordinal): e.g., Customer Satisfaction Rating (Poor, Fair, Good), Education Level (implying order).
                *   Date/Time: e.g., Order Date, Timestamp.
                *   Text/Free-form: e.g., Product Description, Comments.
                *   Boolean: e.g., True/False, Yes/No.
            *   Note any columns with mixed data types or ambiguous formats at this stage.
        *   **Initial Quality Red Flags:** Scan for immediate, glaring issues: Columns that appear entirely empty or filled with identical values; headers that are nonsensical or missing; data formats that are universally incorrect (e.g., dates all formatted as 'YYYYMMDD').

    *   **Phase 2: Rigorous Data Quality Assurance & Cleansing Strategy:** This is the bedrock.
        *   **Missing Value Audit (Comprehensive):**
            *   **Quantification:** For *every* column, provide the exact count and the corresponding percentage of missing entries (NaN, Null, blank).
            *   **Pattern Identification:** Analyze the distribution of missingness. Is it concentrated in specific columns? Are certain rows missing many values? Are there patterns in *which* columns are missing data together?
            *   **Root Cause Hypothesis:** Formulate educated hypotheses regarding the *reasons* behind the missing data. Consider:
                *   *Systematic Issues:* Data collection errors, equipment malfunction, incomplete form submissions.
                *   *Logical Absence:* Data point is not applicable (e.g., 'Previous Employer' for a fresh graduate).
                *   *User Behavior:* Deliberate omission by users/operators.
            *   **Implication Analysis:** Discuss how missing data in specific columns could bias results or invalidate certain analyses (e.g., missing income data biasing demographic analysis).
            *   **Strategic Handling Recommendations:** Propose *specific, justified* strategies for each column with missing data:
                *   **Deletion:** Discuss listwise deletion (removing entire rows) and pairwise deletion (using available data for specific analyses). Justify when these might be acceptable (low % missing overall) or problematic (high % missing, potential bias).
                *   **Imputation Techniques:** Detail various imputation methods and when to apply them:
                    *   *Simple Imputation:* Mean, Median (explain why median is often preferred for skewed data), Mode. Discuss limitations (reduces variance, distorts relationships).
                    *   *Regression Imputation:* Predict missing values based on other variables. Explain the concept.
                    *   *K-Nearest Neighbors (KNN) Imputation:* Impute based on values from similar data points.
                    *   *More Advanced Methods:* Mention (but don't necessarily detail unless appropriate) techniques like Multiple Imputation or using algorithms intrinsically handling missing data.
                *   **Justification:** For each recommendation, explain *why* that method is suitable given the data type, the percentage missing, and the potential analytical goals.
        *   **Uniqueness & Redundancy Validation:**
            *   **Duplicate Record Detection:** Identify and quantify exact duplicate rows. If a primary key or logical identifier exists (e.g., CustomerID, OrderID), check for duplicates based on that identifier as well.
            *   **Impact Assessment:** Explain how duplicate records can distort analyses (e.g., inflated counts, biased averages, incorrect frequency measures).
            *   **Handling Strategy:** Recommend methods for deduplication, specifying criteria (e.g., keep first, keep last, keep based on most complete data).
        *   **Data Type & Format Consistency Enforcement:**
            *   **Cross-Validation:** Re-verify the initial data type assessment. Are dates consistently formatted? Are numerical fields free of currency symbols, commas, or extraneous text? Is categorical data consistently cased (e.g., 'Electronics' vs. 'electronics')?
            *   **Error Identification:** Pinpoint specific examples of inconsistencies or formatting errors within columns.
            *   **Standardization Strategy:** Recommend methods for cleaning and standardizing formats (e.g., converting date formats, removing non-numeric characters from numerical fields, converting text to a consistent case, mapping categorical values).
        *   **Outlier Identification & Contextualization:**
            *   **Methodology Explanation:** Describe the statistical techniques used for outlier detection (e.g., Z-score thresholding, IQR method, visual inspection of box plots). Explain the math conceptually.
            *   **Quantification & Location:** Report the identified outliers for key numerical variables, specifying the row(s) and value(s).
            *   **Critical Interpretation:** Go beyond simple identification. Discuss the *nature* of these outliers:
                *   *Data Entry Errors:* Clearly erroneous values (e.g., negative age).
                *   *Measurement Errors:* Issues with data collection instruments.
                *   *Genuine Extremes:* Legitimate, rare occurrences (e.g., a multi-million dollar sale in typical thousands).
                *   *Potential Fraud/Anomalies:* Unusual patterns that might indicate illicit activity.
            *   **Strategic Handling Recommendations:** Propose reasoned approaches for outliers:
                *   *Correction:* If an error is identifiable and correctable.
                *   *Removal:* Justify removal only if proven to be an error or if analysis specifically requires excluding extremes. Discuss the potential loss of information.
                *   *Transformation:* Apply mathematical transformations (log, square root, Box-Cox) to reduce the impact of extreme values and potentially normalize distributions.
                *   *Capping/Winsorizing:* Replacing outliers with the nearest "acceptable" value (e.g., 95th percentile).
                *   *Separate Analysis:* Analyze outliers as a distinct group.

    *   **Phase 3: Exploratory Data Analysis (EDA) - Deep Dive Discovery:** Unearth the inherent stories within the data.
        *   **Univariate Analysis (Deep Dive):**
            *   **Numerical Variables:**
                *   **Central Tendency:** Report Mean, Median, Mode. Discuss their relationship – does the mean equal the median (suggesting symmetry)? Is the mean higher/lower (indicating positive/negative skew)?
                *   **Dispersion & Spread:** Report Variance, Standard Deviation, Range (Min, Max), IQR. Explain what these metrics reveal about the data's volatility and variability.
                *   **Distribution Shape:** Analyze Skewness and Kurtosis values. Interpret their meaning regarding the data's shape (e.g., Skewness > 1 suggests significant positive skew).
                *   **Visual Conceptualization:** Describe the expected appearance of histograms, density plots, and box plots for key variables, explaining what features (peaks, tails, spread, notches) would signify.
            *   **Categorical Variables:**
                *   **Frequency Distributions:** Report counts and percentages for each category within a variable.
                *   **Mode:** Identify the most frequent category.
                *   **Cardinality:** Note the number of unique categories (especially important for nominal variables).
                *   **Visual Conceptualization:** Describe appropriate visualizations like bar charts (for frequency/counts) and pie charts (use sparingly, for showing proportions of a whole).
            *   **Date/Time Variables:**
                *   Determine the range (min/max dates).
                *   Analyze frequency over time periods (e.g., daily, weekly, monthly counts).
                *   Extract temporal components (e.g., day of week, month, year, hour) and analyze their distributions or impact on other variables.
                *   **Visual Conceptualization:** Describe time-series plots, calendars heatmaps.

        *   **Bivariate & Multivariate Analysis (Relationship Mapping):** This is where the most profound insights lie.
            *   **Numerical vs. Numerical:**
                *   **Correlation Analysis:** Calculate Pearson's r (for linear) and Spearman's rho (for monotonic). Report coefficients and p-values (conceptually, explaining their significance). Create a conceptual correlation matrix visualization.
                *   **Interpretation:** Detail the strength (e.g., weak, moderate, strong) and direction (positive, negative) of linear or monotonic relationships.
                *   **Causation Caveat:** Reiterate the mantra: **CORRELATION IS NOT CAUSATION.** Discuss potential confounding variables.
                *   **Scatter Plot Descriptions:** Describe what scatter plots would visually confirm (e.g., linear trends, clusters, non-linear patterns, presence of outliers influencing correlation).
            *   **Categorical vs. Categorical:**
                *   **Cross-Tabulation (Contingency Tables):** Generate detailed tables showing the joint frequencies of two categorical variables.
                *   **Association Analysis:** Conceptually explain tests like Chi-Squared (χ²) to assess statistical independence. Discuss residuals (observed vs. expected counts) as indicators of association strength.
                *   **Visualization Descriptions:** Describe mosaic plots or stacked/grouped bar charts for visualizing these relationships.
            *   **Numerical vs. Categorical:**
                *   **Grouped Statistics:** Calculate descriptive statistics (mean, median, std dev, count) for the numerical variable *broken down by* each category of the categorical variable.
                *   **Distribution Comparison:** Discuss how the numerical variable's distribution differs across categories.
                *   **Inferential Statistics (Conceptual):** Explain the purpose of tests like Independent Samples t-tests (for two categories) or ANOVA (for more than two categories) – to determine if observed differences in means are statistically significant.
                *   **Visualization Descriptions:** Detail the utility of box plots, violin plots, or grouped histograms for visualizing these comparisons.
            *   **Categorical vs. Numerical:** (Essentially the inverse of the above, analyzing how categories are distributed across numerical ranges).
            *   **Time-Based Relationships:**
                *   Analyze how key metrics change over time (trends, seasonality).
                *   Investigate if relationships between variables change depending on the time period.
                *   **Visualization Descriptions:** Emphasize the importance of time-series plots, seasonal decomposition plots.

    *   **Phase 4: Insight Synthesis & Hypothesis Refinement:** Weave the threads of analysis into a coherent narrative.
        *   **Identify Dominant Patterns:** Synthesize the most significant trends, correlations, and group differences discovered during EDA. What are the 2-3 most critical takeaways?
        *   **Uncover Non-Obvious Insights:** Go beyond the surface level. What surprising relationships or anomalies were found? Why are they significant?
        *   **Formulate & Validate Hypotheses:** Based on the evidence, construct specific, testable hypotheses. (e.g., "Customers acquired during Q3 exhibit a 20% lower lifetime value compared to other quarters, potentially due to a specific promotional campaign.")
        *   **Driver Analysis:** Identify key variables that appear to strongly influence outcomes of interest.
        *   **Segmentation Opportunities:** Highlight potential customer or data segments that exhibit unique characteristics or behaviors.

    *   **Phase 5: Strategic Implications & Actionable Recommendations:** Translate data insights into tangible value.
        *   **Business Contextualization:** Explicitly connect each key insight to potential real-world business or research implications. Answer: "So what?"
            *   *Revenue Opportunities:* Identify potential upsell/cross-sell opportunities, pricing strategies, market expansion possibilities.
            *   *Cost Reduction/Efficiency:* Suggest process improvements, resource optimization, waste reduction.
            *   *Risk Mitigation:* Highlight potential issues, fraud indicators, compliance risks.
            *   *Strategic Planning:* Inform product development, marketing campaigns, operational changes.
        *   **Develop Prioritized Recommendations:** Provide clear, concise, and actionable recommendations. Each recommendation should:
            *   Be directly supported by data evidence.
            *   Specify the action to be taken.
            *   Ideally, suggest a metric for measuring success.
            *   Be prioritized based on potential impact and feasibility.
        *   **Propose Next Steps & Further Research:** Suggest specific follow-up analyses, A/B tests, data collection strategies, or modeling approaches (e.g., predictive modeling, clustering algorithms, anomaly detection systems) that could build upon the current findings.

    *   **Phase 6: Reporting Structure & Communication Excellence:** Present the analysis with utmost professionalism.
        *   **Executive Summary:** A concise, high-level overview (1-2 paragraphs) capturing the essence of the findings, critical insights, and primary recommendations. This is for stakeholders with limited time.
        *   **Detailed Sections:** Structure the full report logically:
            *   1. Introduction & Objective (State the purpose of the analysis).
            *   2. Data Overview (Source, Dimensions, Variable Types).
            *   3. Data Quality Assessment (Detailed findings on missing data, duplicates, format issues, outliers, and proposed handling strategies).
            *   4. Exploratory Data Analysis (Summarize key univariate and bivariate findings, structured by variable type or relationship).
            *   5. Key Insights & Hypotheses (Synthesized findings, surprising observations, formulated hypotheses).
            *   6. Business/Research Implications (Connecting insights to strategic context).
            *   7. Actionable Recommendations (Prioritized list of data-driven actions).
            *   8. Limitations & Future Work (Acknowledging constraints, suggesting next steps).
        *   **Language & Tone:** Maintain a professional, authoritative, yet accessible tone. Explain technical concepts clearly. Avoid ambiguity. Use strong topic sentences for paragraphs.
        *   **Visualization Descriptions:** Articulate *precisely* what kind of visualization would best illustrate each key point (e.g., "A time-series line chart of monthly sales would starkly reveal the seasonal peak in December," "A scatter plot comparing customer tenure against total spending, color-coded by acquisition channel, would help identify high-value customer sources.").

3.  **Contextual Handling & Assumption Management:**
    *   **Explicit Assumptions:** If the CSV's purpose or context isn't provided, clearly state the assumptions made (e.g., "Based on the presence of columns like 'CustomerID', 'PurchaseDate', and 'TotalSpend', I am assuming this dataset pertains to customer transaction history for an e-commerce business.").
    *   **Data Source Neutrality:** Treat the data as presented, but be prepared to comment on potential biases if the source or collection method seems questionable (if such information were available).

4.  **Iterative Refinement & Interaction:**
    *   Acknowledge that analysis can be iterative. Be prepared to answer follow-up questions seeking clarification or deeper dives into specific aspects (e.g., "Can you elaborate on the outlier analysis for the 'Price' column?").
    *   Refine your analysis or recommendations based on hypothetical further information or constraints if prompted.

**COMMENCEMENT OF ANALYSIS IS REQUIRED UPON RECEIPT OF THE CSV DATA.**`;

export async function getApolloAnalysis(summary: ColumnSummary[], fileName: string): Promise<string> {
    const model = "gemini-2.5-flash";
    const prompt = `Your analysis is for a dataset named "${fileName}". Commence your analysis based *only* on the following data summary. Focus exclusively on interpreting the data's structure, quality, and potential insights from the provided summary. Do not refer to the process of receiving the file itself.

Data Summary:
${JSON.stringify(summary, null, 2)}

Please provide your full, multi-phase analysis in markdown format, following all protocols outlined in your directive.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction: apolloSystemInstruction,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error getting Apollo's analysis:", error);
        throw new Error("Apollo is unavailable for consultation at the moment. Please try again later.");
    }
}


const widgetsResponseSchema = {
    type: Type.OBJECT,
    properties: {
        header: {
            type: Type.OBJECT,
            properties: {
                kpis: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, enum: ['kpi_card'] },
                            title: { type: Type.STRING, description: "A short, descriptive title for the KPI." },
                            description: { type: Type.STRING, description: "A brief description of what the KPI represents." },
                            valueColumn: { type: Type.STRING, description: "The column name from the data to perform the aggregation on." },
                            aggregation: { type: Type.STRING, enum: ['SUM', 'AVERAGE', 'COUNT', 'COUNT_DISTINCT'], description: "The aggregation method to apply to the valueColumn." }
                        },
                        required: ['type', 'title', 'description', 'valueColumn', 'aggregation']
                    }
                }
            },
            required: ['kpis']
        },
        body: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['chart'] },
                    title: { type: Type.STRING, description: "A clear and descriptive title for the chart." },
                    description: { type: Type.STRING, description: "A one-sentence explanation of what the chart shows. This will be used for an info tooltip." },
                    chartType: { type: Type.STRING, enum: ['bar', 'line', 'pie', 'scatter', 'area'], description: "The type of chart to render." },
                    xAxisKey: { type: Type.STRING, description: "The column name to use for the X-axis (or labels for pie chart)." },
                    yAxisKeys: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of one or more column names for the Y-axis (or values for pie chart)." }
                },
                required: ['type', 'title', 'description', 'chartType', 'xAxisKey', 'yAxisKeys']
            }
        }
    },
    required: ['header', 'body']
};

type WidgetsSchema = Omit<DashboardSchema, 'header.ai_narrative'>;

export async function getAIDashboardWidgets(summary: ColumnSummary[], fileName: string): Promise<WidgetsSchema> {
    const model = "gemini-2.5-flash";
    const systemInstruction = `You are an expert data analyst and dashboard designer named 'AutoDash AI'.
Your task is to analyze a data summary and generate a structured JSON schema for Key Performance Indicators (KPIs) and data charts.
Another AI, Apollo, is providing a detailed text-based analysis, so your job is to focus ONLY on the visual components.
- Select between 2 and 4 of the most important KPIs. For aggregations, use 'AVERAGE' for means, 'SUM' for totals, and 'COUNT' for record counts. Use COUNT_DISTINCT for unique counts.
- Choose between 4 and 6 charts for the 'body'. Select the most appropriate chart type (bar, line, pie, scatter, area) for each visualization.
- For each chart, also provide a concise one-sentence 'description' explaining what it shows.
- If a date or datetime column is present, you should strongly consider creating a line or area chart to show trends over time.
- For pie charts, the xAxisKey should be the categorical column for slices, and yAxisKeys should be the numerical column for values. If no numerical column, it will be a count.
- For bar/line/area charts, the xAxisKey is typically categorical or a date, and yAxisKeys are numerical.
- For scatter plots, both xAxisKey and yAxisKeys must be numeric columns.
- Ensure all column names in 'valueColumn', 'xAxisKey', and 'yAxisKeys' exactly match the column names provided in the summary.`;

    const prompt = `I have a dataset from the file "${fileName}". Here is a summary of its columns:\n${JSON.stringify(summary, null, 2)}\n\nBased on this summary, generate a complete JSON schema for dashboard widgets (KPIs and charts) following the provided JSON structure.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: widgetsResponseSchema
            }
        });

        const jsonText = response.text.trim();
        const generatedSchema = JSON.parse(jsonText);

        if (!generatedSchema.header || !generatedSchema.body) {
            throw new Error("AI returned an invalid widget schema structure.");
        }

        return generatedSchema as WidgetsSchema;
    } catch (error) {
        console.error("Error generating dashboard widgets with AI:", error);
        throw new Error("The AI failed to generate a valid dashboard widget schema. This might be a temporary issue or a problem with the data format.");
    }
}

const questionSuggestionsResponseSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            description: "An array of 3 to 4 short, insightful questions a user could ask about the data.",
            items: { type: Type.STRING }
        }
    },
    required: ['questions']
};

export async function getQuestionSuggestions(summary: ColumnSummary[]): Promise<string[]> {
    const model = "gemini-2.5-flash";
    const systemInstruction = `You are an expert data analyst. Your task is to look at a summary of a dataset and generate a few example questions that would reveal interesting insights. The questions should be appropriate for a Q&A chat with an AI. Make them concise and varied.`;
    const prompt = `Based on the following data summary, please generate 3-4 insightful questions someone could ask about this data.

Data Summary:
${JSON.stringify(summary, null, 2)}

Respond with a JSON object containing a "questions" array.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: questionSuggestionsResponseSchema
            }
        });
        const json = JSON.parse(response.text.trim());
        return json.questions || [];
    } catch (error) {
        console.error("Error getting question suggestions:", error);
        return []; // Return empty array on failure
    }
}

export async function explainChart(config: ChartWidgetConfig, dataSample: CsvData, summary: ColumnSummary[]): Promise<string> {
    const model = "gemini-2.5-flash";
    const systemInstruction = `You are a helpful data analyst assistant. Your goal is to provide a brief, easy-to-understand explanation of a data chart. Focus on what the chart displays and what the main insight is. Keep it to 2-3 sentences.`;

    const prompt = `Please explain the following chart.
    
    - Chart Title: "${config.title}"
    - Chart Type: ${config.chartType}
    - Description: "${config.description}"
    - X-Axis (categories/groups): "${config.xAxisKey}"
    - Y-Axis (values): "${config.yAxisKeys.join(', ')}"
    
    Here is a summary of the columns used in this dataset:
    ${JSON.stringify(summary.filter(s => s.columnName === config.xAxisKey || config.yAxisKeys.includes(s.columnName)), null, 2)}
    
    Here is a small sample of the data being displayed:
    ${JSON.stringify(dataSample.slice(0, 5), null, 2)}
    
    Provide a concise, 2-3 sentence explanation.`;

    try {
        const response = await ai.models.generateContent({ model, contents: prompt, config: { systemInstruction }});
        return response.text;
    } catch (error) {
        console.error("Error explaining chart:", error);
        throw new Error("Sorry, I was unable to generate an explanation for this chart.");
    }
}

export async function generateSyntheticData(summary: ColumnSummary[], rowCount: number): Promise<CsvData> {
    const model = "gemini-2.5-flash";

    const properties: Record<string, { type: Type, description: string }> = {};
    summary.forEach(col => {
        let geminiType: Type;
        switch(col.inferredType) {
            case ColumnType.NUMERIC:
                geminiType = Type.NUMBER;
                break;
            case ColumnType.DATE:
                geminiType = Type.STRING; 
                break;
            default:
                geminiType = Type.STRING;
        }
        properties[col.columnName] = {
            type: geminiType,
            description: `A synthetic but realistic value for the column '${col.columnName}'. For dates, use YYYY-MM-DD format.`
        };
    });

    const syntheticDataResponseSchema = {
        type: Type.OBJECT,
        properties: {
            data: {
                type: Type.ARRAY,
                description: `An array of ${rowCount} synthetic data objects.`,
                items: {
                    type: Type.OBJECT,
                    properties
                }
            }
        },
        required: ['data']
    };

    const systemInstruction = `You are a sophisticated synthetic data generator. Your purpose is to create realistic, high-quality datasets based on a provided schema. The data should be plausible and internally consistent. For example, if generating sales data, a product's price should be consistent across records. For dates, generate a sensible sequence.`;
    
    const prompt = `Please generate a synthetic dataset with ${rowCount} rows. The data must strictly adhere to the provided JSON schema and be based on the following column analysis. Generate realistic and varied data that respects the characteristics (e.g., stats for numeric columns, common values for categorical) described in the summary.

Column Summary:
${JSON.stringify(summary, null, 2)}

Return a single JSON object with a "data" key, where the value is an array of the generated data objects.`;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: syntheticDataResponseSchema
            }
        });
        const json = JSON.parse(response.text.trim());
        return json.data || [];
    } catch (error) {
        console.error("Error generating synthetic data:", error);
        throw new Error("The AI failed to generate synthetic data. Please try again.");
    }
}

export async function queryDataWithAI(data: CsvData, question: string, summary: ColumnSummary[]): Promise<QaAnswer> {
     const model = "gemini-2.5-flash";
     const systemInstruction = `You are a data analysis assistant with forecasting capabilities. You will be given a JSON dataset and a user question about it.
Your task is to answer the question based on the provided data.
You must respond in a specific JSON format.

**Core Answering Logic:**
1.  **Textual Answer:** If the answer is textual, provide it in the 'text' field.
2.  **Visual Answer:** If the answer is best represented as a chart, provide a complete chart configuration in the 'chart' field.
3.  **Choose One:** You must choose one, either 'text' or 'chart'. If you generate a chart, do not also generate text.
4.  **Inability to Answer:** If you truly cannot answer from the data, explain why in the 'text' field.
5.  **Column Names:** Column names are case-sensitive. Ensure the keys in your chart configuration match the keys in the data exactly.

**Forecasting Protocol:**
1.  **Identify Forecast Request:** If the user's question involves a forecast, prediction, or future trend (e.g., "what will sales be next month?", "forecast revenue for Q3").
2.  **Assess Data Suitability:** Check if the provided data is suitable for a time-series forecast. This requires at least one column that can be interpreted as a date or a sequential time period, and at least one numerical column to forecast.
3.  **Perform Simple Forecast:** If the data is suitable, perform a simple linear trend extrapolation. You don't need complex models. Project the existing trend forward for a reasonable future period (e.g., the next few months, the next quarter).
4.  **CRITICAL DATA RETURN:** If you provide a forecast, you MUST return the *full dataset* for the chart (a combination of the relevant original data points AND the new forecast data points) in the \`chart.data\` field. The original data should be used to create the chart, and your new forecast points should be appended to it.
5.  **Forecast Labeling:**
    *   In the chart's title, clearly label it as a "Forecast".
    *   In the generated data points for the forecast, modify the label in the xAxisKey to indicate it's a forecast. For example, if the xAxisKey is "Date", a forecasted entry could be \`{"Date": "July 2024 (Forecast)", "Sales": 520}\`.
6.  **Disclaimer:** If you provide a forecast, you MUST include a disclaimer in the chart's 'description' field stating that it is a simplified projection based on past trends and not a guarantee of future performance.`;

    // Dynamically build the schema for the 'data' property in the chart object.
    const dataItemProperties: Record<string, { type: Type, description?: string }> = {};
    summary.forEach(col => {
        let geminiType: Type;
        switch(col.inferredType) {
            case ColumnType.NUMERIC:
                geminiType = Type.NUMBER;
                break;
            default: // CATEGORICAL, DATE, UNKNOWN
                geminiType = Type.STRING;
        }
        dataItemProperties[col.columnName] = {
            type: geminiType,
            description: `A value for the '${col.columnName}' column.`
        };
    });

    if (Object.keys(dataItemProperties).length === 0) {
        throw new Error("Cannot query AI: The dataset appears to have no columns.");
    }

    const qaResponseSchema = {
        type: Type.OBJECT,
        properties: {
            text: {
                type: Type.STRING,
                description: "A text-based answer to the user's question. Use this for non-visual answers or if a chart is not possible."
            },
            chart: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['chart'] },
                    title: { type: Type.STRING, description: "A clear and descriptive title for the chart that answers the user's question." },
                    description: { type: Type.STRING, description: "A one-sentence explanation of what the chart shows." },
                    chartType: { type: Type.STRING, enum: ['bar', 'line', 'pie', 'scatter', 'area'] },
                    xAxisKey: { type: Type.STRING },
                    yAxisKeys: { type: Type.ARRAY, items: { type: Type.STRING } },
                    data: {
                        type: Type.ARRAY,
                        description: "The data for the chart, including any new data points like forecasts. If not provided, the original dataset will be used. MUST be provided for forecasts.",
                        items: {
                            type: Type.OBJECT,
                            properties: dataItemProperties,
                        }
                    }
                },
                description: "A chart configuration to visualize the answer. Use this if the answer is best represented visually."
            }
        }
    };


    // To avoid hitting token limits, send a sample of the data.
    const dataSample = data.slice(0, 100);
    const headers = summary.map(c => c.columnName);

    const prompt = `Dataset columns: [${headers.join(', ')}]\n\nData (sample of first 100 rows):\n${JSON.stringify(dataSample, null, 2)}\n\nUser's question: "${question}"\n\nAnswer the question using the provided data and respond in the required JSON format.`;

     try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: qaResponseSchema,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as QaAnswer;

    } catch (error) {
        console.error("Error querying data with AI:", error);
        throw new Error("The AI failed to answer the question.");
    }
}