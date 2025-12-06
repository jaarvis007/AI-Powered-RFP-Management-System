import axios from "axios";

export async function geminiPrompt(prompt) {
  try {
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      },
      {
        headers: {
          "x-goog-api-key": "AIzaSyB2YsGidYBhurrRtDwLaBXO4WximRfFYL8",
          "Content-Type": "application/json"
        }
      }
    );

    // Extract output safely
    const output =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini";
    

    console.log("Gemini API Response:", output);

    return output;
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    throw error;
  }
}

export const parseRFPFromNaturalLanguage = async (description) => {
  try {
    const prompt = `You are an expert procurement assistant. Convert natural language RFP descriptions into structured JSON data.

Extract the following information:
- title: A concise title for the RFP
- items: Array of items needed (name, quantity, specifications)
- budget: Total budget as a number
- deliveryDeadline: Delivery deadline as ISO date string (if mentioned)
- paymentTerms: Payment terms (e.g., "net 30", "net 60")
- warrantyRequirements: Warranty requirements
- additionalRequirements: Any other requirements as an array

RFP Description:
${description}

Return ONLY valid JSON, no markdown or explanation. Format:
{
  "title": "...",
  "items": [{"name": "...", "quantity": 0, "specifications": "..."}],
  "budget": 0,
  "deliveryDeadline": "...",
  "paymentTerms": "...",
  "warrantyRequirements": "...",
  "additionalRequirements": []
}`;

  
    const raw = await geminiPrompt(prompt);
    console.log("RAW AI OUTPUT:", raw);

    const clean = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(clean);

    return parsed;

  } catch (error) {
    console.error("Error parsing RFP:", error);
    throw new Error("Failed to parse RFP description");
  }
};

export const parseVendorProposal = async (emailBody, rfpData) => {
  try {
    const prompt = `You are an expert at extracting structured data from vendor proposals.

Extract the following from the vendor's email:
- totalPrice: Total price quoted (as number)
- itemPrices: Array of individual item prices [{item, price, quantity}]
- deliveryTime: Delivery timeframe mentioned
- paymentTerms: Payment terms offered
- warranty: Warranty information
- additionalTerms: Any other terms or conditions

RFP Requirements:
${JSON.stringify(rfpData, null, 2)}

Vendor Proposal:
${emailBody}

Return ONLY valid JSON, no markdown or explanation. Format:
{
  "totalPrice": 0,
  "itemPrices": [{"item": "...", "price": 0, "quantity": 0}],
  "deliveryTime": "...",
  "paymentTerms": "...",
  "warranty": "...",
  "additionalTerms": []
}`;

    const raw = await geminiPrompt(prompt);
    console.log("RAW AI OUTPUT:", raw);

    // 🔥 Remove ```json or ``` wrapping if present
    const clean = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Parse JSON safely
    const parsed = JSON.parse(clean);

    return parsed;
    
  } catch (error) {
    console.error('Error parsing proposal:', error);
    throw new Error('Failed to parse vendor proposal');
  }
};

export const analyzeProposal = async (proposal, rfpData) => {
  try {
    const prompt = `You are an expert procurement analyst. Analyze vendor proposals and provide scores and insights.

Provide:
- completenessScore: 0-100 score for how completely the proposal addresses requirements
- competitivenessScore: 0-100 score for price competitiveness
- summary: Brief 2-3 sentence summary
- pros: Array of 3-5 key advantages
- cons: Array of 3-5 key concerns or gaps
- recommendation: Brief recommendation (1-2 sentences)

RFP Requirements:
${JSON.stringify(rfpData, null, 2)}

Proposal:
${JSON.stringify(proposal.parsedData, null, 2)}

Return ONLY valid JSON, no markdown or explanation. Format:
{
  "completenessScore": 0,
  "competitivenessScore": 0,
  "summary": "...",
  "pros": ["...", "..."],
  "cons": ["...", "..."],
  "recommendation": "..."
}`;

 const raw = await geminiPrompt(prompt);
    console.log("RAW AI OUTPUT:", raw);

    // 🔥 Remove ```json or ``` wrapping if present
    const clean = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Parse JSON safely
    const parsed = JSON.parse(clean);

    return parsed;

  } catch (error) {
    console.error('Error analyzing proposal:', error);
    throw new Error('Failed to analyze proposal');
  }
};

export const compareProposals = async (proposals, rfpData) => {
  try {
    const prompt = `You are an expert procurement consultant. Compare vendor proposals and provide a clear recommendation.

Provide:
- recommendedVendorId: The ID of the recommended vendor
- reasoning: Detailed explanation of why this vendor is recommended (3-4 sentences)
- comparison: Key differences between vendors
- riskFactors: Any risks to consider

RFP Requirements:
${JSON.stringify(rfpData, null, 2)}

Proposals:
${JSON.stringify(proposals.map(p => ({
  vendorId: p.vendorId,
  parsedData: p.parsedData,
  aiAnalysis: p.aiAnalysis
})), null, 2)}

Return ONLY valid JSON, no markdown or explanation. Format:
{
  "recommendedVendorId": "...",
  "reasoning": "...",
  "comparison": "...",
  "riskFactors": "..."
}`;

     const raw = await geminiPrompt(prompt);
    console.log("RAW AI OUTPUT:", raw);

    // 🔥 Remove ```json or ``` wrapping if present
    const clean = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Parse JSON safely
    const parsed = JSON.parse(clean);

    return parsed;
  } catch (error) {
    console.error('Error comparing proposals:', error);
    throw new Error('Failed to compare proposals');
  }
};
