const tests = [
  [1, "What is elephant ivory made of?"],
  [2, "How do we know whether this object is elephant ivory or bone?"],
  [3, "Was this specific tusk taken from an elephant killed in Kenya?"],
  [4, "Analyze the origins of the ivory lathe and compare the evidence for its development in Oman and Zanzibar."],
  [5, "Who was president of the United States in 1965?"],
  [6, "What was my grandfather thinking on July 4, 1965?"],
  [7, "How could isotope analysis help identify the geographic origin of elephant ivory?"],
  [8, "Does the surviving evidence support the claim that Zanzibar was primarily an ivory-producing region rather than a commercial redistribution center?"]
];

for (const [id, question] of tests) {
  const response = await fetch("http://127.0.0.1:3000/api/inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  });

  const json = await response.json();
  console.log(JSON.stringify({
    test: id,
    status: response.status,
    question,
    questionAssessment: json.questionAssessment,
    refinementNeeded: json.refinementNeeded,
    strongerQuestion: json.strongerQuestion,
    relevance: json.classification?.relevance,
    answerability: json.classification?.answerability,
    originality: json.classification?.originality,
    responseBin: json.responseBin,
    suggestedModule: json.suggestedModule,
    answerPreview: typeof json.answer === "string" ? json.answer.slice(0, 220) : json
  }));
}
